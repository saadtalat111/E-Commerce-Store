// filepath: c:\Users\aimra\Desktop\MusaProject\server\routes\products.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware for protected routes

const router = express.Router();

// --- Public Route ---

// GET /api/products - Get all products with filtering, searching, sorting
router.get('/', async (req, res) => {
    // --- Extract query parameters ---
    const { search, category, minPrice, maxPrice, sortBy, order = 'DESC' } = req.query; // Default order DESC
    let baseQuery = `
        SELECT
            p.product_id, p.name, p.description, p.price, p.stock_quantity, p.image_url,
            p.created_at, p.updated_at,
            p.seller_id,
            c.name as category_name,
            u.username as seller_username
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN users u ON p.seller_id = u.user_id
    `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Search condition (name or description)
    if (search) {
        conditions.push(`(LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex})`);
        values.push(`%${search.toLowerCase()}%`);
        paramIndex++;
    }

    // Category filter (using category name for simplicity, could use ID)
    if (category) {
        conditions.push(`LOWER(c.name) = LOWER($${paramIndex})`);
        values.push(category);
        paramIndex++;
    }

    // Price range filter
    if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
            conditions.push(`p.price >= $${paramIndex}`);
            values.push(min);
            paramIndex++;
        }
    }
    if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
            conditions.push(`p.price <= $${paramIndex}`);
            values.push(max);
            paramIndex++;
        }
    }

    // Append WHERE clause if conditions exist
    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting logic
    let orderByClause = ' ORDER BY p.created_at'; // Default sort
    const validSortColumns = ['name', 'price', 'created_at'];
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // Validate order

    if (sortBy && validSortColumns.includes(sortBy.toLowerCase())) {
        orderByClause = ` ORDER BY p.${sortBy.toLowerCase()} ${sortOrder}`;
    }
    baseQuery += orderByClause;

    // --- Execute the query ---
    try {
        console.log('Executing Query:', baseQuery); // For debugging
        console.log('With Values:', values);      // For debugging
        const result = await db.query(baseQuery, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching products with filters:', err);
        res.status(500).json({ message: 'Server error fetching products.' });
    }
});

// GET /api/products/:id - Get a single product by ID (public)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT
                p.product_id, p.name, p.description, p.price, p.stock_quantity, p.image_url,
                p.created_at, p.updated_at,
                p.seller_id,
                c.category_id, c.name as category_name,
                u.user_id as seller_id, u.username as seller_username
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN users u ON p.seller_id = u.user_id
            WHERE p.product_id = $1;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        // Handle potential error if ID format is wrong for the data type (e.g., non-integer for SERIAL)
        res.status(500).json({ message: 'Server error fetching product.' });
    }
});


// --- Protected Routes (Require Login) ---

// POST /api/products - Create a new product (Requires Seller or Admin role)
router.post('/', authenticateToken, async (req, res) => {
    // Check user role (must be seller or admin)
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only sellers or admins can create products.' });
    }

    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    const seller_id = req.user.userId; // Get seller ID from authenticated user token
    const userRole = req.user.role;

    // --- Basic Input Validation ---

    if (userRole !== 'seller' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Only sellers or admins can create products.' });
    }

    if (!name || !description || price === undefined || stock_quantity === undefined) {
        return res.status(400).json({ message: 'Name, description, price, and stock quantity are required.' });
    }
    if (isNaN(price) || price <= 0) {
         return res.status(400).json({ message: 'Price must be a positive number.' });
    }
     if (isNaN(stock_quantity) || stock_quantity < 0 || !Number.isInteger(stock_quantity)) {
         return res.status(400).json({ message: 'Stock quantity must be a non-negative integer.' });
     }

    try {
        const newProductQuery = `
            INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, seller_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *; -- Return the newly created product
        `;
        const result = await db.query(newProductQuery, [
            name,
            description,
            price,
            stock_quantity,
            category_id || null, // Use null if category_id is not provided/valid
            image_url || null,
            seller_id
        ]);

        res.status(201).json({
            message: 'Product created successfully!',
            product: result.rows[0]
        });

    } catch (err) {
        console.error('Error creating product:', err);
         // Handle potential foreign key constraint errors (e.g., invalid category_id)
        if (err.code === '23503') { // Foreign key violation
             return res.status(400).json({ message: 'Invalid category ID provided.' });
        }
        res.status(500).json({ message: 'Server error creating product.' });
    }
});

// --- NEW: PUT /api/products/:id - Update a product ---
router.put('/:id', authenticateToken, async (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // --- Basic Validation ---
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
        // 1. Find the product and its owner
        const findQuery = 'SELECT seller_id FROM products WHERE product_id = $1';
        const findResult = await db.query(findQuery, [productId]);

        if (findResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const productOwnerId = findResult.rows[0].seller_id;

        // 2. Authorization Check: Allow if user is the owner OR an admin
        if (productOwnerId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to update this product.' });
        }

        // 3. Construct update query dynamically 
        const updateQuery = `
            UPDATE products
            SET name = $1,
                description = $2,
                price = $3,
                stock_quantity = $4,
                category_id = $5,
                image_url = $6
                -- updated_at is handled by trigger
            WHERE product_id = $7
            RETURNING *;
        `;
        // Ensure values are correctly handled if some are optional/null
        const values = [
            name,
            description,
            price,
            stock_quantity,
            category_id || null,
            image_url || null,
            productId
        ];

        const result = await db.query(updateQuery, values);

        if (result.rows.length === 0) {
             // Should not happen if findQuery worked, but good safety check
             return res.status(404).json({ message: 'Product not found during update.' });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(`Error updating product ${productId}:`, err);
         // Handle potential constraint errors (e.g., invalid category_id)
        if (err.code === '23503') { // Foreign key violation
             return res.status(400).json({ message: 'Invalid category ID specified.' });
        }
        res.status(500).json({ message: 'Server error updating product.' });
    }
});


// --- NEW: DELETE /api/products/:id - Delete a product ---
router.delete('/:id', authenticateToken, async (req, res) => {
    const productId = parseInt(req.params.id);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // --- Basic Validation ---
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
        // 1. Find the product and its owner
        const findQuery = 'SELECT seller_id FROM products WHERE product_id = $1';
        const findResult = await db.query(findQuery, [productId]);

        if (findResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const productOwnerId = findResult.rows[0].seller_id;

        // 2. Authorization Check: Allow if user is the owner OR an admin
        if (productOwnerId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this product.' });
        }

        // 3. Delete the product
        const deleteQuery = 'DELETE FROM products WHERE product_id = $1 RETURNING product_id;';
        const result = await db.query(deleteQuery, [productId]);

        if (result.rowCount === 0) {
             // Should not happen if findQuery worked
             return res.status(404).json({ message: 'Product not found during deletion.' });
        }

        res.status(200).json({ message: `Product with ID ${productId} deleted successfully.` });

    } catch (err) {
        console.error(`Error deleting product ${productId}:`, err);
        res.status(500).json({ message: 'Server error deleting product.' });
    }
});

module.exports = router;
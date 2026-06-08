// filepath: c:\Users\aimra\Desktop\MusaProject\server\routes\cart.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// ALL cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get the current user's cart contents
router.get('/', async (req, res) => {
    const userId = req.user.userId; // Get user ID from authenticated token

    try {
        const query = `
            SELECT
                ci.cart_item_id,
                ci.quantity,
                ci.added_at,
                p.product_id,
                p.name,
                p.price,
                p.image_url,
                p.stock_quantity -- Include stock quantity to check availability on frontend
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.user_id = $1
            ORDER BY ci.added_at DESC;
        `;
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ message: 'Server error fetching cart contents.' });
    }
});

// POST /api/cart - Add an item to the cart (or update quantity if exists)
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body; // Default quantity to 1 if not provided

    // --- Basic Validation ---
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Valid Product ID and positive integer quantity are required.' });
    }

    try {
        // Check product stock before attempting to add
        const stockCheck = await db.query('SELECT stock_quantity FROM products WHERE product_id = $1', [productId]);
        if (stockCheck.rows.length === 0) {
             return res.status(404).json({ message: 'Product not found.' });
        }
        const availableStock = stockCheck.rows[0].stock_quantity;

        // Use UPSERT logic: Insert or Update quantity on conflict (user_id, product_id)
        const upsertQuery = `
            INSERT INTO cart_items (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET
                quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4), -- Add quantity, but cap at available stock
                added_at = NOW()
            RETURNING *;
        `;

        const result = await db.query(upsertQuery, [userId, productId, quantity, availableStock]);

         // Check if the resulting quantity exceeds stock (can happen if multiple rapid adds occur, though LEAST helps)
         if (result.rows[0].quantity > availableStock) {
             await db.query('UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2', [availableStock, result.rows[0].cart_item_id]);
             return res.status(400).json({ message: `Cannot add ${quantity}. Only ${availableStock} items available. Cart updated to max available.` });
         }


        res.status(201).json({
            message: 'Item added/updated in cart successfully!',
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error('Error adding to cart:', err);
         // Handle potential foreign key constraint errors (e.g., invalid product_id)
        if (err.code === '23503') { // Foreign key violation
             return res.status(404).json({ message: 'Product not found.' });
        }
         // Handle check constraint violation (e.g., quantity <= 0, though validated earlier)
         if (err.code === '23514') {
             return res.status(400).json({ message: 'Invalid quantity.' });
         }
        res.status(500).json({ message: 'Server error adding item to cart.' });
    }
});

// PUT /api/cart/:itemId - Update the quantity of a specific cart item
router.put('/:itemId', async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // --- Basic Validation ---
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Valid positive integer quantity is required.' });
    }
    // Ensure itemId is a number if using SERIAL PKs for cart_items
    if (isNaN(parseInt(itemId))) {
         return res.status(400).json({ message: 'Invalid cart item ID format.' });
    }

    try {
        // Get product ID and current stock for the item being updated
        const itemInfoQuery = await db.query(
            `SELECT ci.product_id, p.stock_quantity
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_item_id = $1 AND ci.user_id = $2`,
            [itemId, userId]
        );

        if (itemInfoQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user.' });
        }

        const { stock_quantity } = itemInfoQuery.rows[0];

        // Check if requested quantity exceeds stock
        if (quantity > stock_quantity) {
            return res.status(400).json({ message: `Cannot set quantity to ${quantity}. Only ${stock_quantity} items available.` });
        }

        // Update the quantity for the specific cart item belonging to the user
        const updateQuery = `
            UPDATE cart_items
            SET quantity = $1, added_at = NOW()
            WHERE cart_item_id = $2 AND user_id = $3
            RETURNING *;
        `;
        const result = await db.query(updateQuery, [quantity, itemId, userId]);

        // Check if any row was actually updated (handles case where itemId is valid but doesn't belong to user)
        if (result.rows.length === 0) {
             return res.status(404).json({ message: 'Cart item not found or update failed.' });
        }


        res.status(200).json({
            message: 'Cart item quantity updated successfully!',
            cartItem: result.rows[0]
        });

    } catch (err) {
        console.error('Error updating cart item quantity:', err);
         // Handle check constraint violation (e.g., quantity <= 0)
         if (err.code === '23514') {
             return res.status(400).json({ message: 'Invalid quantity.' });
         }
        res.status(500).json({ message: 'Server error updating cart item.' });
    }
});


// DELETE /api/cart/:itemId - Remove a specific item from the cart
router.delete('/:itemId', async (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.params;

     // Ensure itemId is a number if using SERIAL PKs
    if (isNaN(parseInt(itemId))) {
         return res.status(400).json({ message: 'Invalid cart item ID format.' });
    }

    try {
        // Delete the item only if it belongs to the current user
        const deleteQuery = `
            DELETE FROM cart_items
            WHERE cart_item_id = $1 AND user_id = $2
            RETURNING cart_item_id; -- Return the ID if deletion was successful
        `;
        const result = await db.query(deleteQuery, [itemId, userId]);

        // Check if a row was actually deleted
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to user.' });
        }

        res.status(200).json({ message: 'Item removed from cart successfully.' }); // Or use 204 No Content

    } catch (err) {
        console.error('Error removing cart item:', err);
        res.status(500).json({ message: 'Server error removing item from cart.' });
    }
});

module.exports = router;
// filepath: c:\Users\aimra\Desktop\MusaProject\server\routes\categories.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken'); // For protected routes

const router = express.Router();

// GET /api/categories - Fetch all categories (Public or Authenticated)

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT category_id, name FROM categories ORDER BY name');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Server error fetching categories." });
    }
});

// --- Admin Only Routes ---

// POST /api/categories - Create a new category (Admin Only)
router.post('/', authenticateToken, async (req, res) => {
    // Authorization
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a non-empty string.' });
    }

    try {
        // Check if category already exists (case-insensitive check)
        const existing = await db.query('SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1)', [name.trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Category with this name already exists.' });
        }

        const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *;';
        const result = await db.query(query, [name.trim()]);
        res.status(201).json({ message: 'Category created successfully.', category: result.rows[0] });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Server error creating category.' });
    }
});

// PUT /api/categories/:id - Update a category (Admin Only)
router.put('/:id', authenticateToken, async (req, res) => {
    // Authorization
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const categoryId = parseInt(req.params.id);
    const { name } = req.body;

    if (isNaN(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID.' });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a non-empty string.' });
    }

    try {
        // Check if new name conflicts with another existing category
        const existing = await db.query('SELECT category_id FROM categories WHERE LOWER(name) = LOWER($1) AND category_id != $2', [name.trim(), categoryId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Another category with this name already exists.' });
        }

        const query = 'UPDATE categories SET name = $1 WHERE category_id = $2 RETURNING *;';
        const result = await db.query(query, [name.trim(), categoryId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json({ message: 'Category updated successfully.', category: result.rows[0] });
    } catch (err) {
        console.error(`Error updating category ${categoryId}:`, err);
        res.status(500).json({ message: 'Server error updating category.' });
    }
});

// DELETE /api/categories/:id - Delete a category (Admin Only)
router.delete('/:id', authenticateToken, async (req, res) => {
    // Authorization
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID.' });
    }
    // (Prevent deletion) for safety:
    try {
        // Check if any products use this category
        const productCheck = await db.query('SELECT 1 FROM products WHERE category_id = $1 LIMIT 1', [categoryId]);
        if (productCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Cannot delete category: It is currently assigned to one or more products. Reassign products first.' });
        }

        // If no products are using it, proceed with deletion
        const deleteQuery = 'DELETE FROM categories WHERE category_id = $1 RETURNING category_id;';
        const result = await db.query(deleteQuery, [categoryId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        res.status(200).json({ message: `Category with ID ${categoryId} deleted successfully.` });

    } catch (err) {
        console.error(`Error deleting category ${categoryId}:`, err);
        res.status(500).json({ message: 'Server error deleting category.' });
    }
});


module.exports = router;
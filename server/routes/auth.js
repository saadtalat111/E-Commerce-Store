// filepath:server\routes\auth.js
const express = require('express');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const db = require('../db'); 
const authenticateToken = require('../middleware/authenticateToken'); 

const router = express.Router();
const saltRounds = 10; // Cost factor for bcrypt hashing

// POST /api/auth/register - User Registration
router.post('/register', async (req, res) => {
    const { username, email, password, firstName, lastName, role } = req.body;

    // --- Input Validation (Basic Example) ---
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        // --- Check if user already exists ---
        const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email or username already exists.' }); // 409 Conflict
        }

        // --- Hash the password ---
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // --- Insert new user into database ---
        const newUserQuery = `
            INSERT INTO users (username, email, password_hash, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, username, email, role, created_at;
        `;
        // Use 'buyer' as default role if not provided, or validate provided role
        const userRole = role && ['buyer', 'seller', 'admin'].includes(role) ? role : 'buyer';

        const newUser = await db.query(newUserQuery, [
            username,
            email,
            passwordHash,
            firstName, 
            lastName,  
            userRole
        ]);

        // --- Send Success Response ---
        // Don't send the password hash back!
        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('Registration Error:', err);
        // Check for specific DB errors if needed (e.g., unique constraint violation)
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    // --- Basic Input Validation ---
    if (!emailOrUsername || !password) {
        return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    try {
        // --- Find user by email or username ---
        const userQuery = await db.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [emailOrUsername]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
        }

        const user = userQuery.rows[0];

        // --- Compare submitted password with stored hash ---
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
        }

        // --- Generate JWT ---
        // Create a payload for the token (don't include sensitive info like password hash)
        const payload = {
            userId: user.user_id,
            username: user.username,
            role: user.role,
        };

        // Sign the token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Use the secret from .env
            { expiresIn: '1h' } // Token expiration time (e.g., 1 hour, 1d, 7d)
        );

        // --- Send Success Response with Token ---
        res.status(200).json({
            message: 'Login successful!',
            token: token, // Send the token to the client
            user: { // Send back some user info 
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
    // If authenticateToken middleware succeeds, req.user will be populated
    try {
        // Fetch potentially more user details from DB if needed, using req.user.userId
        const userQuery = await db.query('SELECT user_id, username, email, role, first_name, last_name, created_at FROM users WHERE user_id = $1', [req.user.userId]);

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Profile data fetched successfully!',
            user: userQuery.rows[0] // Send back detailed user info (excluding password)
        });

    } catch (err) {
        console.error('Profile Fetch Error:', err);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

module.exports = router;
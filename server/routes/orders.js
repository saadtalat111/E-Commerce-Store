// filepath: c:\Users\aimra\Desktop\MusaProject\server\routes\orders.js
const express = require('express');
const db = require('../db'); // Assuming db exports a pool or client
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// ALL order routes require authentication
router.use(authenticateToken);

// POST /api/orders - Place a new order from the user's cart
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    // Use a database transaction to ensure atomicity
    const client = await db.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Get cart items for the user and lock product rows for update
        const cartQuery = `
            SELECT
                ci.cart_item_id, ci.quantity AS cart_quantity,
                p.product_id, p.price, p.stock_quantity
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.user_id = $1
            FOR UPDATE OF p; -- Lock product rows involved in the cart
        `;
        const cartResult = await client.query(cartQuery, [userId]);
        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            await client.query('ROLLBACK'); // No need to proceed if cart is empty
            return res.status(400).json({ message: 'Cannot place order with an empty cart.' });
        }

        // 2. Validate stock and calculate total amount
        let totalAmount = 0;
        const orderItemsData = []; // To store data for order_items insertion

        for (const item of cartItems) {
            if (item.cart_quantity > item.stock_quantity) {
                await client.query('ROLLBACK'); // Abort transaction
                return res.status(400).json({
                    message: `Insufficient stock for product ID ${item.product_id}. Requested: ${item.cart_quantity}, Available: ${item.stock_quantity}.`
                });
            }
            const itemTotal = parseFloat(item.price) * item.cart_quantity;
            totalAmount += itemTotal;
            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.cart_quantity,
                price_at_purchase: item.price // Record price at time of purchase
            });
        }
        // 4. Create the order record
        const orderInsertQuery = `
            INSERT INTO orders (user_id, total_amount, status) -- Add shipping_address etc. if needed
            VALUES ($1, $2, $3)
            RETURNING order_id, created_at;
        `;
        // Status 'pending' initially, update later based on payment/shipping
        const orderResult = await client.query(orderInsertQuery, [userId, totalAmount.toFixed(2), 'pending']);
        const newOrderId = orderResult.rows[0].order_id;
        const orderCreatedAt = orderResult.rows[0].created_at;


        // 5. Create order_items records
        const orderItemInsertPromises = orderItemsData.map(item => {
            const itemInsertQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES ($1, $2, $3, $4);
            `;
            return client.query(itemInsertQuery, [newOrderId, item.product_id, item.quantity, item.price_at_purchase]);
        });
        await Promise.all(orderItemInsertPromises);


        // 6. Update product stock quantities
        const stockUpdatePromises = cartItems.map(item => {
            const newStock = item.stock_quantity - item.cart_quantity;
            const stockUpdateQuery = `
                UPDATE products SET stock_quantity = $1 WHERE product_id = $2;
            `;
            return client.query(stockUpdateQuery, [newStock, item.product_id]);
        });
        await Promise.all(stockUpdatePromises);


        // 7. Clear the user's cart
        const clearCartQuery = `DELETE FROM cart_items WHERE user_id = $1;`;
        await client.query(clearCartQuery, [userId]);


        // 8. Commit the transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Order placed successfully!',
            order: {
                orderId: newOrderId,
                userId: userId,
                totalAmount: totalAmount.toFixed(2),
                status: 'pending',
                createdAt: orderCreatedAt,
                items: orderItemsData // Return items placed in this order
            }
        });

    } catch (err) {
        // If any error occurs, rollback the transaction
        await client.query('ROLLBACK');
        console.error('Error placing order:', err);
        // Check for specific error types if needed (e.g., constraint violations)
        res.status(500).json({ message: 'Server error placing order.' });
    } finally {
        client.release();
    }
});

// --- NEW: GET /api/orders - Get order history for the logged-in user ---
router.get('/', async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT
                order_id,
                total_amount,
                status,
                created_at
            FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC; -- Show most recent orders first
        `;
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ message: 'Server error fetching order history.' });
    }
});

// --- NEW: GET /api/orders/:orderId - Get details for a specific order ---
router.get('/:orderId', async (req, res) => {
    const userId = req.user.userId;
    const { orderId } = req.params;

    // Validate orderId format if necessary (e.g., is it an integer?)
    if (isNaN(parseInt(orderId))) {
         return res.status(400).json({ message: 'Invalid order ID format.' });
    }


    try {
        // Fetch order details ensuring it belongs to the logged-in user
        const orderQuery = `
            SELECT
                o.order_id, o.total_amount, o.status, o.created_at, o.updated_at
                -- Add shipping address etc. here if they exist in the table
            FROM orders o
            WHERE o.order_id = $1 AND o.user_id = $2;
        `;
        const orderResult = await db.query(orderQuery, [orderId, userId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
        }

        const orderDetails = orderResult.rows[0];

        // Fetch associated order items
        const itemsQuery = `
            SELECT
                oi.order_item_id, oi.quantity, oi.price_at_purchase,
                p.product_id, p.name AS product_name, p.image_url AS product_image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id -- Use JOIN, LEFT JOIN if product might be deleted
            WHERE oi.order_id = $1;
        `;
        const itemsResult = await db.query(itemsQuery, [orderId]);

        // Combine order details with items
        const fullOrder = {
            ...orderDetails,
            items: itemsResult.rows
        };

        res.status(200).json(fullOrder);

    } catch (err) {
        console.error(`Error fetching order details for order ${orderId}:`, err);
        res.status(500).json({ message: 'Server error fetching order details.' });
    }
});

// --- NEW: GET /api/orders/admin/all - Get ALL orders (Admin Only) ---
router.get('/admin/all', async (req, res) => {
    // Authorization Check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    try {
        const query = `
            SELECT
                o.order_id,
                o.user_id,
                u.username AS user_username, -- Get username for context
                o.total_amount,
                o.status,
                o.created_at,
                o.updated_at
            FROM orders o
            JOIN users u ON o.user_id = u.user_id -- Join to get username
            ORDER BY o.created_at DESC; -- Show most recent first
        `;
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching all orders for admin:', err);
        res.status(500).json({ message: 'Server error fetching all orders.' });
    }
});

// --- NEW: PUT /api/orders/admin/:orderId/status - Update Order Status (Admin Only) ---
router.put('/admin/:orderId/status', async (req, res) => {
    // Authorization Check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    const { orderId } = req.params;
    const { status } = req.body; 

    // Validate status 
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (isNaN(parseInt(orderId))) {
         return res.status(400).json({ message: 'Invalid order ID format.' });
    }

    try {
        const updateQuery = `
            UPDATE orders
            SET status = $1
            -- updated_at is handled by trigger
            WHERE order_id = $2
            RETURNING *; -- Return updated order
        `;
        const result = await db.query(updateQuery, [status.toLowerCase(), orderId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.status(200).json({ message: 'Order status updated successfully.', order: result.rows[0] });

    } catch (err) {
        console.error(`Error updating status for order ${orderId}:`, err);
        res.status(500).json({ message: 'Server error updating order status.' });
    }
});

module.exports = router;
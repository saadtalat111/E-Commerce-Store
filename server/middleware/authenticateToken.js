// filepath:server\middleware\authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Get token from Authorization header (format: "Bearer TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token part

    if (token == null) {
        // No token provided
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            // Token might be expired or invalid
            return res.sendStatus(403); // Forbidden
        }
        // Token is valid, attach payload to request object
        req.user = user; // Contains { userId, username, role, iat, exp }
        next(); 
    });
}

module.exports = authenticateToken;
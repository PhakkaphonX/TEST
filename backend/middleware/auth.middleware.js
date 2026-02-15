/**
 * =====================================================
 * Authentication Middleware
 * JWT Token Verification
 * =====================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thai-food-analysis-secret-key';

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use Bearer <token>'
            });
        }

        const token = parts[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Add user ID to request
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error verifying token',
            error: error.message
        });
    }
};

// Optional auth middleware (doesn't require token but adds user if present)
exports.optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                req.userId = decoded.userId;
            }
        }
        
        next();
    } catch (error) {
        // Token invalid, continue without user
        next();
    }
};

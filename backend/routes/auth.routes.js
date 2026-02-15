/**
 * =====================================================
 * Authentication Routes
 * /api/auth
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', verifyToken, authController.getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', verifyToken, authController.updateProfile);

// PUT /api/auth/change-password - Change password (protected)
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;

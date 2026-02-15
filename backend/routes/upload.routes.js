/**
 * =====================================================
 * Upload Routes
 * /api/upload
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/upload/image - Upload single image
router.post('/image', uploadController.uploadImage);

// POST /api/upload/images - Upload multiple images
router.post('/images', uploadController.uploadMultipleImages);

// GET /api/upload/info/:filename - Get image info
router.get('/info/:filename', uploadController.getImageInfo);

// DELETE /api/upload/:filename - Delete image (protected)
router.delete('/:filename', verifyToken, uploadController.deleteImage);

module.exports = router;

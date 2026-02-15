/**
 * =====================================================
 * Upload Controller
 * Handles image uploads for food detection
 * =====================================================
 */

const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Uploads directory
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
fs.ensureDirSync(uploadsDir);

// Upload image from base64 data
exports.uploadImage = async (req, res) => {
    try {
        const { imageData, filename } = req.body;
        
        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        // Validate base64 image
        const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        if (!base64Pattern.test(imageData)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Only JPEG, PNG, GIF, and WebP are supported'
            });
        }

        // Extract base64 data
        const matches = imageData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({
                success: false,
                message: 'Invalid base64 image data'
            });
        }

        const imageType = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        
        // Generate unique filename
        const uniqueFilename = filename ? 
            `${Date.now()}-${filename}` : 
            `${Date.now()}-${uuidv4()}.${imageType}`;
        
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        // Save file
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(filePath, buffer);
        
        // Return file URL
        const fileUrl = `/uploads/${uniqueFilename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: uniqueFilename,
                url: fileUrl,
                path: filePath,
                size: buffer.length
            }
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
    try {
        const { images } = req.body;
        
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Images array is required'
            });
        }

        const uploadedFiles = [];
        
        for (const imageData of images) {
            if (!imageData) continue;

            // Extract base64 data
            const matches = imageData.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/);
            if (!matches) continue;

            const imageType = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const base64Data = matches[2];
            
            const uniqueFilename = `${Date.now()}-${uuidv4()}.${imageType}`;
            const filePath = path.join(uploadsDir, uniqueFilename);
            
            const buffer = Buffer.from(base64Data, 'base64');
            await fs.writeFile(filePath, buffer);
            
            uploadedFiles.push({
                filename: uniqueFilename,
                url: `/uploads/${uniqueFilename}`,
                size: buffer.length
            });
        }

        res.json({
            success: true,
            message: `${uploadedFiles.length} images uploaded successfully`,
            data: { files: uploadedFiles }
        });
    } catch (error) {
        console.error('Upload multiple images error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
};

// Delete uploaded image
exports.deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'Filename is required'
            });
        }

        // Security: prevent directory traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(uploadsDir, safeFilename);
        
        // Check if file exists
        const exists = await fs.pathExists(filePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Delete file
        await fs.remove(filePath);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
};

// Get image info
exports.getImageInfo = async (req, res) => {
    try {
        const { filename } = req.params;
        
        const safeFilename = path.basename(filename);
        const filePath = path.join(uploadsDir, safeFilename);
        
        const exists = await fs.pathExists(filePath);
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const stats = await fs.stat(filePath);

        res.json({
            success: true,
            data: {
                filename: safeFilename,
                url: `/uploads/${safeFilename}`,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            }
        });
    } catch (error) {
        console.error('Get image info error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting image info',
            error: error.message
        });
    }
};

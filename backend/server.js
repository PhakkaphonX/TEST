/**
 * =====================================================
 * Thai Food Analysis Backend Server
 * Express.js + MySQL API Server
 * =====================================================
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs-extra');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const logRoutes = require('./routes/log.routes');
const uploadRoutes = require('./routes/upload.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve static files from frontend (in production)
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve Teachable Machine model files (they live outside frontend/)
app.use('/tm-my-image-model', express.static(path.join(__dirname, '../tm-my-image-model')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/upload', uploadRoutes);

// AI Prediction endpoint
app.post('/api/predict', async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        // AI prediction will be handled by frontend TensorFlow.js
        // This endpoint can be used for server-side prediction if needed
        res.json({
            success: true,
            message: 'Prediction endpoint ready. AI processing is handled by TensorFlow.js in the browser.'
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing prediction',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Thai Food Analysis API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint - redirect to frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('Thai Food Analysis API Server');
    console.log('='.repeat(50));
    console.log(`Server running on port: ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});

module.exports = app;

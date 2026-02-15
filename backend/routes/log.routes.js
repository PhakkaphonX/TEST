/**
 * =====================================================
 * Food Log Routes
 * /api/logs
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const foodLogController = require('../controllers/foodlog.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/logs - Create new food log (protected)
router.post('/', verifyToken, foodLogController.createLog);

// GET /api/logs - Get user's food logs (protected)
router.get('/', verifyToken, foodLogController.getUserLogs);

// GET /api/logs/today - Get today's calories (protected)
router.get('/today', verifyToken, foodLogController.getTodayCalories);

// GET /api/logs/weekly - Get weekly calories (protected)
router.get('/weekly', verifyToken, foodLogController.getWeeklyCalories);

// GET /api/logs/monthly - Get monthly statistics (protected)
router.get('/monthly', verifyToken, foodLogController.getMonthlyStats);

// GET /api/logs/dashboard - Get dashboard data (protected)
router.get('/dashboard', verifyToken, foodLogController.getDashboard);

// GET /api/logs/summary - Get nutrition summary for date range (protected)
router.get('/summary', verifyToken, foodLogController.getNutritionSummary);

// DELETE /api/logs/:id - Delete food log (protected)
router.delete('/:id', verifyToken, foodLogController.deleteLog);

module.exports = router;

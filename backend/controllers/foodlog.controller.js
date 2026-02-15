/**
 * =====================================================
 * Food Log Controller
 * Handles user food history and statistics
 * =====================================================
 */

const FoodLog = require('../models/foodlog.model');

// Create new food log
exports.createLog = async (req, res) => {
    try {
        const userId = req.userId;
        const logData = {
            user_id: userId,
            ...req.body
        };

        // Validation
        if (!logData.food_name || !logData.calories) {
            return res.status(400).json({
                success: false,
                message: 'Food name and calories are required'
            });
        }

        const logId = await FoodLog.create(logData);
        const log = await FoodLog.findById(logId);

        res.status(201).json({
            success: true,
            message: 'Food log created successfully',
            data: { log }
        });
    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating food log',
            error: error.message
        });
    }
};

// Get user's food logs
exports.getUserLogs = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 50, offset = 0 } = req.query;

        const logs = await FoodLog.findByUserId(userId, parseInt(limit), parseInt(offset));
        const total = await FoodLog.getCount(userId);

        res.json({
            success: true,
            count: logs.length,
            total,
            data: { logs }
        });
    } catch (error) {
        console.error('Get user logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching food logs',
            error: error.message
        });
    }
};

// Get today's calories
exports.getTodayCalories = async (req, res) => {
    try {
        const userId = req.userId;
        const stats = await FoodLog.getTodayCalories(userId);

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get today calories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s calories',
            error: error.message
        });
    }
};

// Get weekly calories
exports.getWeeklyCalories = async (req, res) => {
    try {
        const userId = req.userId;
        const weeklyStats = await FoodLog.getWeeklyCalories(userId);

        // Calculate weekly total
        const weeklyTotal = weeklyStats.reduce((sum, day) => sum + parseFloat(day.total_calories), 0);
        const avgDaily = weeklyStats.length > 0 ? weeklyTotal / weeklyStats.length : 0;

        res.json({
            success: true,
            data: {
                daily: weeklyStats,
                weekly_total: weeklyTotal,
                avg_daily: avgDaily.toFixed(2),
                days_tracked: weeklyStats.length
            }
        });
    } catch (error) {
        console.error('Get weekly calories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly calories',
            error: error.message
        });
    }
};

// Get monthly statistics
exports.getMonthlyStats = async (req, res) => {
    try {
        const userId = req.userId;
        const stats = await FoodLog.getMonthlyStats(userId);

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get monthly stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly statistics',
            error: error.message
        });
    }
};

// Get dashboard data (combined stats)
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get all stats in parallel
        const [todayStats, weeklyStats, monthlyStats] = await Promise.all([
            FoodLog.getTodayCalories(userId),
            FoodLog.getWeeklyCalories(userId),
            FoodLog.getMonthlyStats(userId)
        ]);

        // Calculate weekly total
        const weeklyTotal = weeklyStats.reduce((sum, day) => sum + parseFloat(day.total_calories), 0);

        // Get recent logs (last 5)
        const recentLogs = await FoodLog.findByUserId(userId, 5, 0);

        res.json({
            success: true,
            data: {
                today: todayStats,
                week: {
                    total: weeklyTotal,
                    daily: weeklyStats,
                    avg: weeklyStats.length > 0 ? (weeklyTotal / weeklyStats.length).toFixed(2) : 0
                },
                month: monthlyStats,
                recent_logs: recentLogs
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// Get nutrition summary for date range
exports.getNutritionSummary = async (req, res) => {
    try {
        const userId = req.userId;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const summary = await FoodLog.getNutritionSummary(userId, startDate, endDate);

        // Calculate totals
        const totals = summary.reduce((acc, day) => {
            acc.calories += parseFloat(day.total_calories);
            acc.protein += parseFloat(day.total_protein);
            acc.fat += parseFloat(day.total_fat);
            acc.carbs += parseFloat(day.total_carbs);
            return acc;
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

        res.json({
            success: true,
            data: {
                daily: summary,
                totals: {
                    calories: totals.calories.toFixed(2),
                    protein: totals.protein.toFixed(2),
                    fat: totals.fat.toFixed(2),
                    carbs: totals.carbs.toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error('Get nutrition summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nutrition summary',
            error: error.message
        });
    }
};

// Delete food log
exports.deleteLog = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const result = await FoodLog.delete(id, userId);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Food log not found or not authorized'
            });
        }

        res.json({
            success: true,
            message: 'Food log deleted successfully'
        });
    } catch (error) {
        console.error('Delete log error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting food log',
            error: error.message
        });
    }
};

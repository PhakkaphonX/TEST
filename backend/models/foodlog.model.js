/**
 * =====================================================
 * Food Log Model
 * Database operations for food_logs table
 * =====================================================
 */

const { Database } = require('./db');

class FoodLog {
    // Create new food log
    static async create(logData) {
        const { 
            user_id, 
            food_name, 
            food_name_th, 
            calories, 
            protein, 
            fat, 
            carbs, 
            confidence, 
            image_path 
        } = logData;
        
        const sql = `
            INSERT INTO food_logs 
            (user_id, food_name, food_name_th, calories, protein, fat, carbs, confidence, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await Database.query(sql, [
            user_id, food_name, food_name_th, calories, protein, fat, carbs, confidence, image_path
        ]);
        
        return result.insertId;
    }

    // Get logs by user ID
    static async findByUserId(userId, limit = 50, offset = 0) {
        const sql = `
            SELECT 
                fl.id,
                fl.food_name,
                fl.food_name_th,
                fl.calories,
                fl.protein,
                fl.fat,
                fl.carbs,
                fl.confidence,
                fl.image_path,
                fl.created_at
            FROM food_logs fl
            WHERE fl.user_id = ?
            ORDER BY fl.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        return await Database.query(sql, [userId, limit, offset]);
    }

    // Get log by ID
    static async findById(id) {
        const sql = `
            SELECT 
                fl.id,
                fl.user_id,
                fl.food_name,
                fl.food_name_th,
                fl.calories,
                fl.protein,
                fl.fat,
                fl.carbs,
                fl.confidence,
                fl.image_path,
                fl.created_at
            FROM food_logs fl
            WHERE fl.id = ?
        `;
        
        const results = await Database.query(sql, [id]);
        return results[0] || null;
    }

    // Get today's calories for user
    static async getTodayCalories(userId) {
        const sql = `
            SELECT COALESCE(SUM(calories), 0) as total_calories,
                   COUNT(*) as meal_count
            FROM food_logs
            WHERE user_id = ? 
            AND DATE(created_at) = CURDATE()
        `;
        
        const results = await Database.query(sql, [userId]);
        return results[0] || { total_calories: 0, meal_count: 0 };
    }

    // Get weekly calories for user
    static async getWeeklyCalories(userId) {
        const sql = `
            SELECT 
                DATE(created_at) as date,
                COALESCE(SUM(calories), 0) as total_calories,
                COUNT(*) as meal_count
            FROM food_logs
            WHERE user_id = ? 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `;
        
        return await Database.query(sql, [userId]);
    }

    // Get monthly statistics
    static async getMonthlyStats(userId) {
        const sql = `
            SELECT 
                COALESCE(SUM(calories), 0) as total_calories,
                COALESCE(AVG(calories), 0) as avg_calories,
                COUNT(*) as total_meals,
                COUNT(DISTINCT DATE(created_at)) as active_days
            FROM food_logs
            WHERE user_id = ? 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `;
        
        const results = await Database.query(sql, [userId]);
        return results[0] || { total_calories: 0, avg_calories: 0, total_meals: 0, active_days: 0 };
    }

    // Get nutrition summary for date range
    static async getNutritionSummary(userId, startDate, endDate) {
        const sql = `
            SELECT 
                DATE(created_at) as date,
                COALESCE(SUM(calories), 0) as total_calories,
                COALESCE(SUM(protein), 0) as total_protein,
                COALESCE(SUM(fat), 0) as total_fat,
                COALESCE(SUM(carbs), 0) as total_carbs,
                COUNT(*) as meal_count
            FROM food_logs
            WHERE user_id = ? 
            AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `;
        
        return await Database.query(sql, [userId, startDate, endDate]);
    }

    // Delete log
    static async delete(id, userId) {
        const sql = 'DELETE FROM food_logs WHERE id = ? AND user_id = ?';
        return await Database.query(sql, [id, userId]);
    }

    // Get total count for pagination
    static async getCount(userId) {
        const sql = 'SELECT COUNT(*) as count FROM food_logs WHERE user_id = ?';
        const results = await Database.query(sql, [userId]);
        return results[0].count;
    }
}

module.exports = FoodLog;

/**
 * =====================================================
 * Food Model
 * Database operations for foods table
 * =====================================================
 */

const { Database } = require('./db');

class Food {
    // Get all foods
    static async findAll() {
        const sql = `
            SELECT id, name, name_th, calories, protein, fat, carbs, category, description
            FROM foods
            ORDER BY name
        `;
        
        return await Database.query(sql);
    }

    // Get food by ID
    static async findById(id) {
        const sql = `
            SELECT id, name, name_th, calories, protein, fat, carbs, category, description
            FROM foods
            WHERE id = ?
        `;
        
        const results = await Database.query(sql, [id]);
        return results[0] || null;
    }

    // Get food by name (fuzzy search)
    static async findByName(name) {
        const sql = `
            SELECT id, name, name_th, calories, protein, fat, carbs, category, description
            FROM foods
            WHERE name LIKE ? OR name_th LIKE ?
        `;
        
        const searchPattern = `%${name}%`;
        return await Database.query(sql, [searchPattern, searchPattern]);
    }

    // Get food by exact name
    static async findByExactName(name) {
        const sql = `
            SELECT id, name, name_th, calories, protein, fat, carbs, category, description
            FROM foods
            WHERE name = ? OR name_th = ?
        `;
        
        const results = await Database.query(sql, [name, name]);
        return results[0] || null;
    }

    // Get foods by category
    static async findByCategory(category) {
        const sql = `
            SELECT id, name, name_th, calories, protein, fat, carbs, category, description
            FROM foods
            WHERE category = ?
            ORDER BY name
        `;
        
        return await Database.query(sql, [category]);
    }

    // Get all categories
    static async getCategories() {
        const sql = `
            SELECT DISTINCT category
            FROM foods
            WHERE category IS NOT NULL
            ORDER BY category
        `;
        
        const results = await Database.query(sql);
        return results.map(r => r.category);
    }

    // Create new food
    static async create(foodData) {
        const { name, name_th, calories, protein, fat, carbs, category, description } = foodData;
        
        const sql = `
            INSERT INTO foods (name, name_th, calories, protein, fat, carbs, category, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await Database.query(sql, [
            name, name_th, calories, protein, fat, carbs, category, description
        ]);
        
        return result.insertId;
    }

    // Update food
    static async update(id, foodData) {
        const allowedFields = ['name', 'name_th', 'calories', 'protein', 'fat', 'carbs', 'category', 'description'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(foodData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return null;

        values.push(id);
        const sql = `UPDATE foods SET ${updates.join(', ')} WHERE id = ?`;
        
        return await Database.query(sql, values);
    }

    // Delete food
    static async delete(id) {
        const sql = 'DELETE FROM foods WHERE id = ?';
        return await Database.query(sql, [id]);
    }
}

module.exports = Food;

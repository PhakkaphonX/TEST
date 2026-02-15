/**
 * =====================================================
 * User Model
 * Database operations for users table
 * =====================================================
 */

const { Database } = require('./db');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        const { username, email, password } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
        `;
        
        const result = await Database.query(sql, [username, email, hashedPassword]);
        return result.insertId;
    }

    // Find user by ID
    static async findById(id) {
        const sql = `
            SELECT id, username, email, created_at, updated_at
            FROM users
            WHERE id = ?
        `;
        
        const results = await Database.query(sql, [id]);
        return results[0] || null;
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = `
            SELECT id, username, email, password, created_at
            FROM users
            WHERE email = ?
        `;
        
        const results = await Database.query(sql, [email]);
        return results[0] || null;
    }

    // Find user by username
    static async findByUsername(username) {
        const sql = `
            SELECT id, username, email, created_at
            FROM users
            WHERE username = ?
        `;
        
        const results = await Database.query(sql, [username]);
        return results[0] || null;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update user
    static async update(id, updateData) {
        const allowedFields = ['username', 'email', 'password'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                if (key === 'password') {
                    updates.push(`${key} = ?`);
                    values.push(await bcrypt.hash(value, 10));
                } else {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }
        }

        if (updates.length === 0) return null;

        values.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        
        return await Database.query(sql, values);
    }

    // Delete user
    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        return await Database.query(sql, [id]);
    }
}

module.exports = User;

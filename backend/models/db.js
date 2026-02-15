/**
 * =====================================================
 * Database Configuration and Connection Pool
 * MySQL2 with connection pooling
 * =====================================================
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'thai_food_analysis',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database helper class
class Database {
    // Get a connection from the pool
    static async getConnection() {
        return await pool.getConnection();
    }

    // Execute a query
    static async query(sql, params = []) {
        try {
            const [results] = await pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Execute a transaction
    static async transaction(queries) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const results = [];
            for (const { sql, params } of queries) {
                const [result] = await connection.execute(sql, params);
                results.push(result);
            }
            
            await connection.commit();
            return results;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Test database connection
    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('✓ Database connected successfully');
            connection.release();
            return true;
        } catch (error) {
            console.error('✗ Database connection failed:', error.message);
            return false;
        }
    }
}

module.exports = { Database, pool };

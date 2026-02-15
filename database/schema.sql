-- =====================================================
-- Thai Food Analysis Database Schema
-- Database: thai_food_analysis
-- =====================================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS thai_food_analysis;
CREATE DATABASE thai_food_analysis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE thai_food_analysis;

-- =====================================================
-- Table: users
-- Stores user account information
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: foods
-- Stores Thai food nutrition information
-- =====================================================
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_th VARCHAR(100),
    calories INT NOT NULL DEFAULT 0,
    protein DECIMAL(5,2) DEFAULT 0,
    fat DECIMAL(5,2) DEFAULT 0,
    carbs DECIMAL(5,2) DEFAULT 0,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: food_logs
-- Stores user's food detection history
-- =====================================================
CREATE TABLE food_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_name VARCHAR(100) NOT NULL,
    food_name_th VARCHAR(100),
    calories INT NOT NULL DEFAULT 0,
    protein DECIMAL(5,2) DEFAULT 0,
    fat DECIMAL(5,2) DEFAULT 0,
    carbs DECIMAL(5,2) DEFAULT 0,
    confidence DECIMAL(5,2) DEFAULT 0,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert Sample Thai Food Data
-- =====================================================
INSERT INTO foods (name, name_th, calories, protein, fat, carbs, category) VALUES
('Pad Thai', 'ผัดไทย', 445, 15.5, 18.2, 55.3, 'Noodles'),
('Tom Yum Goong', 'ต้มยำกุ้ง', 120, 18.5, 3.2, 8.5, 'Soup'),
('Green Curry', 'แกงเขียวหวาน', 395, 22.5, 28.5, 12.3, 'Curry'),
('Massaman Curry', 'แกงมัสมั่น', 485, 18.5, 32.5, 28.5, 'Curry'),
('Som Tum', 'ส้มตำ', 95, 3.2, 2.5, 15.8, 'Salad'),
('Mango Sticky Rice', 'ข้าวเหนียวมะม่วง', 320, 4.5, 8.5, 58.5, 'Dessert'),
('Pad Krapow Moo', 'ผัดกระเพราหมู', 325, 18.5, 22.5, 12.5, 'Stir Fry'),
('Pad See Ew', 'ผัดซีอิ๊ว', 385, 14.5, 12.5, 52.5, 'Noodles'),
('Khao Pad', 'ข้าวผัด', 420, 12.5, 15.5, 55.5, 'Rice'),
('Khao Soi', 'ข้าวซอย', 485, 16.5, 22.5, 55.5, 'Noodles'),
('Laab', 'ลาบ', 285, 22.5, 18.5, 8.5, 'Salad'),
('Kai Yang', 'ไก่ย่าง', 285, 32.5, 15.5, 2.5, 'Grill'),
('Satay', 'สะเต๊ะ', 325, 18.5, 22.5, 12.5, 'Grill'),
('Spring Rolls', 'ปอเปี๊ยะ', 185, 5.5, 8.5, 22.5, 'Appetizer'),
('Tod Mun Pla', 'ทอดมันปลา', 225, 12.5, 12.5, 18.5, 'Appetizer'),
('Pla Raet Kluai', 'ปลาแรดทอด', 265, 22.5, 15.5, 8.5, 'Fried'),
('Khanom Jeen', 'ขนมจีน', 225, 4.5, 2.5, 45.5, 'Noodles'),
('Khao Kha Moo', 'ข้าวหมูขาอ่อน', 485, 28.5, 22.5, 45.5, 'Rice'),
('Nam Tok', 'น้ำตก', 295, 24.5, 18.5, 8.5, 'Salad'),
('Yam Woon Sen', 'ยำวุ้นเส้น', 145, 6.5, 4.5, 18.5, 'Salad'),
('Hor Mok', 'ห่อหมก', 245, 16.5, 15.5, 12.5, 'Steam'),
('Pla Nueng Manao', 'ปลานึ่งมะนาว', 185, 28.5, 5.5, 8.5, 'Steam'),
('Gai Pad Met Mamuang', 'ไก่ผัดเม็ดมะม่วงหิมพานต์', 385, 22.5, 18.5, 32.5, 'Stir Fry'),
('Kung Op Wun Sen', 'กุ้งอบวุ้นเส้น', 285, 22.5, 12.5, 22.5, 'Steam'),
('Chu Chee Pla', 'ฉู่ฉี่ปลา', 285, 24.5, 18.5, 8.5, 'Curry');

-- Insert default test user (password: password123)
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@example.com', '$2b$10$YourHashedPasswordHere');

-- Insert sample food logs for test user
INSERT INTO food_logs (user_id, food_name, food_name_th, calories, protein, fat, carbs, confidence, image_path) VALUES
(1, 'Pad Thai', 'ผัดไทย', 445, 15.5, 18.2, 55.3, 95.5, '/uploads/sample1.jpg'),
(1, 'Tom Yum Goong', 'ต้มยำกุ้ง', 120, 18.5, 3.2, 8.5, 92.5, '/uploads/sample2.jpg'),
(1, 'Green Curry', 'แกงเขียวหวาน', 395, 22.5, 28.5, 12.3, 88.5, '/uploads/sample3.jpg');

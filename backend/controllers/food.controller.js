/**
 * =====================================================
 * Food Controller
 * Handles food-related operations
 * =====================================================
 */

const Food = require('../models/food.model');

// Get all foods
exports.getAllFoods = async (req, res) => {
    try {
        const foods = await Food.findAll();
        
        res.json({
            success: true,
            count: foods.length,
            data: { foods }
        });
    } catch (error) {
        console.error('Get all foods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching foods',
            error: error.message
        });
    }
};

// Get food by ID
exports.getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findById(id);
        
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }

        res.json({
            success: true,
            data: { food }
        });
    } catch (error) {
        console.error('Get food by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching food',
            error: error.message
        });
    }
};

// Search foods
exports.searchFoods = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const foods = await Food.findByName(q);
        
        res.json({
            success: true,
            count: foods.length,
            data: { foods }
        });
    } catch (error) {
        console.error('Search foods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching foods',
            error: error.message
        });
    }
};

// Get foods by category
exports.getFoodsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const foods = await Food.findByCategory(category);
        
        res.json({
            success: true,
            count: foods.length,
            data: { foods }
        });
    } catch (error) {
        console.error('Get foods by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching foods by category',
            error: error.message
        });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Food.getCategories();
        
        res.json({
            success: true,
            count: categories.length,
            data: { categories }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Create new food (admin only)
exports.createFood = async (req, res) => {
    try {
        const foodData = req.body;
        
        // Validation
        if (!foodData.name || !foodData.calories) {
            return res.status(400).json({
                success: false,
                message: 'Name and calories are required'
            });
        }

        const foodId = await Food.create(foodData);
        const food = await Food.findById(foodId);
        
        res.status(201).json({
            success: true,
            message: 'Food created successfully',
            data: { food }
        });
    } catch (error) {
        console.error('Create food error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating food',
            error: error.message
        });
    }
};

// Update food
exports.updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const foodData = req.body;
        
        await Food.update(id, foodData);
        const food = await Food.findById(id);
        
        res.json({
            success: true,
            message: 'Food updated successfully',
            data: { food }
        });
    } catch (error) {
        console.error('Update food error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating food',
            error: error.message
        });
    }
};

// Delete food
exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Food.delete(id);
        
        res.json({
            success: true,
            message: 'Food deleted successfully'
        });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting food',
            error: error.message
        });
    }
};

// Get food nutrition by name (for AI predictions)
exports.getFoodNutrition = async (req, res) => {
    try {
        const { name } = req.params;
        const food = await Food.findByExactName(name);
        
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found in database'
            });
        }

        res.json({
            success: true,
            data: { food }
        });
    } catch (error) {
        console.error('Get food nutrition error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching food nutrition',
            error: error.message
        });
    }
};

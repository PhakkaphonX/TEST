/**
 * =====================================================
 * Food Routes
 * /api/foods
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');

// GET /api/foods - Get all foods
router.get('/', foodController.getAllFoods);

// GET /api/foods/categories - Get all categories
router.get('/categories', foodController.getCategories);

// GET /api/foods/search - Search foods
router.get('/search', foodController.searchFoods);

// GET /api/foods/category/:category - Get foods by category
router.get('/category/:category', foodController.getFoodsByCategory);

// GET /api/foods/nutrition/:name - Get food nutrition by name
router.get('/nutrition/:name', foodController.getFoodNutrition);

// GET /api/foods/:id - Get food by ID
router.get('/:id', foodController.getFoodById);

// POST /api/foods - Create new food
router.post('/', foodController.createFood);

// PUT /api/foods/:id - Update food
router.put('/:id', foodController.updateFood);

// DELETE /api/foods/:id - Delete food
router.delete('/:id', foodController.deleteFood);

module.exports = router;

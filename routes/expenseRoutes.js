// routes/expenseRoutes.js

const express = require('express');
const router = express.Router();

// Import controller functions
const { getExpenses, addExpense } = require('../controller/expenseController.js');

// Define routes and map them to controller functions
// GET /api/expenses -> to get all expenses
router.get('/', getExpenses);

// POST /api/expenses -> to add a new expense
router.post('/', addExpense);

// We can add more routes here later (for updating, deleting, etc.)

module.exports = router;

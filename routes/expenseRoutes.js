// Import Express and create a router
const express = require('express');
const router = express.Router();
// Import controller functions for expenses
const {
    getExpenses,
    addExpense,
    getExpense,
    deleteExpense,
    updateExpense,
    getMonthlyReport,
    getBudget,
    setBudget
} = require('../controller/expenseController');

// Routes for budget management
router.get('/budget', getBudget);
router.post('/budget', setBudget);

// Route for monthly expense reports
router.get('/report/:year/:month', getMonthlyReport);

// Routes for all expenses (GET all, POST new)
router
    .route('/')
    .get(getExpenses)
    .post(addExpense);

// Routes for single expense by ID (GET, DELETE, PUT)
router
    .route('/:id')
    .get(getExpense)
    .delete(deleteExpense)
    .put(updateExpense);

// Export the router
module.exports = router;

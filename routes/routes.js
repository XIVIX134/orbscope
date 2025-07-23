const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import controller functions for expenses
const { getExpenses, addExpense, getExpense, deleteExpense, updateExpense, getMonthlyReport } = require('../controller/expenseController');
// Import the Budget model
const Budget = mongoose.model('Budget');

// Expense Routes
const expenseRouter = express.Router();
expenseRouter.get('/report/:year/:month', getMonthlyReport);
expenseRouter.route('/').get(getExpenses).post(addExpense);
expenseRouter.route('/:id').get(getExpense).delete(deleteExpense).put(updateExpense);

// Budget Routes
const budgetRouter = express.Router();
budgetRouter.get('/', async (req, res) => {
  try {
    const budget = await Budget.findOne(); // Fetch the single budget document
    res.json(budget || { limit: 0 }); // Return default if no budget exists
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
budgetRouter.post('/', async (req, res) => {
  try {
    const { limit } = req.body;
    if (limit === undefined || typeof limit !== 'number' || limit < 0) {
      return res.status(400).json({ message: 'Budget limit (number) is required and must be non-negative.' });
    }

    let budget = await Budget.findOne(); // Try to find the existing budget
    if (budget) {
      // If budget exists, update it
      budget.limit = limit;
      await budget.save();
      res.status(200).json(budget);
    } else {
      // If no budget exists, create a new one
      budget = new Budget({ limit });
      await budget.save();
      res.status(201).json(budget);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mount individual routers
router.use('/expenses', expenseRouter);
router.use('/budgets', budgetRouter);

module.exports = router; 
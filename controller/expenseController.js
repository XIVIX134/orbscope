// controllers/expenseController.js

// In a real app, this data would come from a database,
// but for now, we're using a mock JSON file.
const expenses = require('../Data/expenses.json');
const fs = require('fs');
const path = require('path');

// Path to the data file
const dataPath = path.join(__dirname, '..', 'Data', 'expenses.json');

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Public
 */
const getExpenses = (req, res) => {
  res.status(200).json({ success: true, data: expenses });
};

/**
 * @desc    Add a new expense
 * @route   POST /api/expenses
 * @access  Public
 */
const addExpense = (req, res) => {
  const { title, amount, category } = req.body;

  // Simple input validation
  if (!title || !amount || !category) {
    return res.status(400).json({ success: false, message: 'Please provide all fields' });
  }

  // Create a new expense
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1, // Create a unique ID
    title,
    amount,
    category,
    date: new Date().toISOString().split('T')[0] // Today's date
  };

  // Add the new expense to the list
  expenses.push(newExpense);

  // Write the updated data back to the file
  fs.writeFile(dataPath, JSON.stringify(expenses, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
    res.status(201).json({ success: true, data: newExpense });
  });
};

module.exports = {
  getExpenses,
  addExpense,
};

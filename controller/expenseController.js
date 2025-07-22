const expenses = require('../Data/expenses.json');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'Data', 'expenses.json');
const getExpenses = (req, res) => {
  res.status(200).json({ success: true, data: expenses });
};
const addExpense = (req, res) => {
  const { title, amount, category } = req.body;
  if (!title || !amount || !category) {
    return res.status(400).json({ success: false, message: 'Please provide all fields' });
  }
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    title,
    amount,
    category,
    date: new Date().toISOString().split('T')[0]
  };
  expenses.push(newExpense);
  fs.writeFile(dataPath, JSON.stringify(expenses, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
    res.status(201).json({ success: true, data: newExpense });
  });
};
module.exports = {
  getExpenses,
  addExpense,
};

const express = require('express');
const router = express.Router();
const { getExpenses, addExpense } = require('../controller/expenseController.js');
router.get('/', getExpenses);
router.post('/', addExpense);
module.exports = router;

const express = require('express');
const router = express.Router();
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
// Budget routes
router.get('/budget', getBudget);
router.post('/budget', setBudget);
// Monthly report route
router.get('/report/:year/:month', getMonthlyReport);

router
    .route('/')
    .get(getExpenses)
    .post(addExpense);

router
    .route('/:id')
    .get(getExpense)
    .delete(deleteExpense)
    .put(updateExpense);

module.exports = router;

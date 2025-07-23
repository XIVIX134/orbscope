// --- Budget Additions ---
const fs = require('fs');
const path = require('path');
const budgetFilePath = path.join(__dirname, '..', 'data', 'budget.json');

// Helper to read budget
function readBudget() {
    if (!fs.existsSync(budgetFilePath)) return { budget: 0 };
    const data = fs.readFileSync(budgetFilePath);
    if (!data.length) return { budget: 0 };
    try {
        return JSON.parse(data);
    } catch {
        return { budget: 0 };
    }
}

// Helper to write budget
function writeBudget(budgetObj) {
    fs.writeFileSync(budgetFilePath, JSON.stringify(budgetObj, null, 2));
}

// @desc    Get the budget
// @route   GET /api/expenses/budget
const getBudget = (req, res) => {
    const data = readBudget();
    res.json(data);
};

// @desc    Set the budget
// @route   POST /api/expenses/budget
const setBudget = (req, res) => {
    const { budget } = req.body;
    if (budget === undefined) {
        return res.status(400).json({ message: 'Budget amount is required.' });
    }
    const budgetObj = { budget: parseFloat(budget) };
    writeBudget(budgetObj);
    res.status(200).json(budgetObj);
};

const Expense = require('../models/Expense');

// @desc    Gets all expenses
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Adds an expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        const expense = new Expense({ description, amount, category, date });
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Gets a single expense
// @route   GET /api/expenses/:id
const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (expense) {
            res.json(expense);
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID' });
    }
};

// @desc    Deletes an expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.json({ message: 'Expense deleted' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID' });
    }
};

// @desc    Updates an expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            { description, amount, category, date },
            { new: true, runValidators: true }
        );
        if (updated) {
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Invalid data or ID' });
    }
};

// @desc    Get monthly report
// @route   GET /api/expenses/report/:year/:month
const getMonthlyReport = async (req, res) => {
    const { year, month } = req.params;
    try {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        const filtered = await Expense.find({
            date: { $gte: start, $lt: end }
        });
        // Group by category and sum amounts
        const report = {};
        filtered.forEach(e => {
            const cat = e.category || 'Uncategorized';
            if (!report[cat]) report[cat] = 0;
            report[cat] += Number(e.amount) || 0;
        });
        // Read budget from file
        let budget = 0;
        try {
            const budgetData = readBudget();
            budget = typeof budgetData.budget === 'number' ? budgetData.budget : 0;
        } catch {
            budget = 0;
        }
        res.json({
            year: parseInt(year),
            month: parseInt(month),
            total: filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
            byCategory: report,
            count: filtered.length,
            budget
        });
    } catch (err) {
        res.status(400).json({ message: 'Invalid date or server error' });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    getExpense,
    deleteExpense,
    updateExpense,
    getMonthlyReport,
    // Budget additions
    getBudget,
    setBudget
};

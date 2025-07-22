const express = require('express');
const path = require('path');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Expense Tracker API</h1>');
});
app.use('/api/expenses', expenseRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in development mode on http://localhost:${PORT}`);
});

// app.js

const express = require('express');
const path = require('path');

// Import routes
const expenseRoutes = require('./routes/expenseRoutes');

// Initialize Express app
const app = express();

// Middleware to parse JSON request bodies
// This allows us to access data sent in the request via req.body
app.use(express.json());

// Welcome message for the root path
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Expense Tracker API</h1>');
});

// Use the expense routes
// Any request starting with /api/expenses will be handled by expenseRoutes
app.use('/api/expenses', expenseRoutes);

// Define the port the server will run on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running in development mode on http://localhost:${PORT}`);
});

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
// Custom logger middleware
const logger = require('./middleware/logger');

// Initialize the Express app
const app = express();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
// Connect to MongoDB
mongoose.connect(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('MongoDB connected');
}).catch(err => {
	console.error('MongoDB connection error:', err);
});

// Define the schema for an Expense document
const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true }, // Description of the expense
  amount: { type: Number, required: true },     // Amount of the expense
  category: { type: String, required: true },   // Category of the expense
  date: { type: Date, default: Date.now }       // Date of the expense (defaults to now)
});

// Register the Expense model with Mongoose
const Expense = mongoose.model('Expense', ExpenseSchema);

// Import expense routes after the Expense model is defined
const expenseRoutes = require('./routes/expenseRoutes');

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom logger middleware
app.use(logger);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use expense routes for API endpoints
app.use('/api/expenses', expenseRoutes);

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));

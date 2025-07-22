
const express = require('express');
const mongoose = require('mongoose');
const expenseRoutes = require('./routes/expenseRoutes');
const logger = require('./middleware/logger');

const app = express();

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
mongoose.connect(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('MongoDB connected');
}).catch(err => {
	console.error('MongoDB connection error:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
app.use(logger);

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Middleware/logger.js

/**
 * @desc    Logs the request method and URL to the console
 */
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  // Call next() to pass control to the next middleware function in the stack
  next(); 
};

module.exports = logger;

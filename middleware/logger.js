// This middleware logs information about incoming requests.
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next(); // Pass control to the next middleware or route handler
};

module.exports = logger;

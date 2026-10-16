/**
 * Reusable higher-order function that catches async rejections
 * and forwards them to the Express next() error handler,
 * eliminating repetitive try/catch boilerplate across controllers.
 *
 * @param {Function} fn - Async Express middleware/controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

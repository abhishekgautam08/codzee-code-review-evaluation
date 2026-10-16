const { BadRequestError } = require('../utils/errors');

const validateTaskQuery = (req, _res, next) => {
  const { page, limit, status, priority, sort } = req.query;

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return next(new BadRequestError('Page parameter must be a positive integer greater than 0'));
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return next(new BadRequestError('Limit parameter must be an integer between 1 and 100'));
    }
  }

  const allowedStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !allowedStatuses.includes(status)) {
    return next(new BadRequestError(`Invalid status filter. Allowed values: ${allowedStatuses.join(', ')}`));
  }

  const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !allowedPriorities.includes(priority)) {
    return next(new BadRequestError(`Invalid priority filter. Allowed values: ${allowedPriorities.join(', ')}`));
  }

  const allowedSortFields = [
    'createdAt', '-createdAt',
    'dueDate', '-dueDate',
    'priority', '-priority',
    'title', '-title'
  ];
  if (sort && !allowedSortFields.includes(sort)) {
    return next(new BadRequestError(`Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`));
  }

  next();
};

module.exports = {
  validateTaskQuery
};

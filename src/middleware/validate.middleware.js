const { z } = require('zod');
const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issueDetails = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join(', ');
      return next(new BadRequestError(`Validation failed: ${issueDetails}`));
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').trim(),
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['member', 'admin']).optional().default('member')
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema
};

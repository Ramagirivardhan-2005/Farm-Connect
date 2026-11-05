/**
 * Centralized Error Handling Middleware (Instruction 88)
 * Ensures user-friendly error responses and strictly prevents stack trace leakage.
 */
export function errorHandler(err, req, res, next) {
  console.error('[FarmConnect Error]', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // State Machine illegal transition error
  if (err.message?.includes('Illegal State Machine Transition')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default internal server error (never expose stack trace)
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal error occurred. Please try again later.',
  });
}

export default errorHandler;

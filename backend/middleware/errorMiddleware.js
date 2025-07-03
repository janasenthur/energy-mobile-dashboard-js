const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific database errors
  if (err.code === '23505') {
    statusCode = 400;
    message = 'Duplicate entry - resource already exists';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference - related resource not found';
  } else if (err.code === '23502') {
    statusCode = 400;
    message = 'Missing required field';
  } else if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid data format';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.details?.map(detail => detail.message).join(', ') || err.message;
  }

  // Log error
  logger.error(`${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};

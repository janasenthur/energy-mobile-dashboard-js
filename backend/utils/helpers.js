const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRE 
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate random token (for password reset, etc.)
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate job number
const generateJobNumber = () => {
  const prefix = 'JOB';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate tracking code
const generateTrackingCode = () => {
  const prefix = 'TRK';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Estimate delivery time based on distance
const estimateDeliveryTime = (distance, averageSpeed = 50) => {
  // averageSpeed in km/h, returns time in minutes
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  // Add buffer time for stops, traffic, etc.
  const bufferTime = Math.ceil(distance * 2); // 2 minutes per km buffer
  
  return timeInMinutes + bufferTime;
};

// Format response with pagination
const formatPaginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total_records: parseInt(total),
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
};

// Format success response
const formatSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Format error response
const formatErrorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: error.message || error,
    statusCode
  };
};

// Sanitize user data (remove sensitive fields)
const sanitizeUser = (user) => {
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Generate random color for user avatar
const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#54A0FF', '#2ED573', '#FF6348', '#FF4757', '#3742FA'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Parse query filters
const parseFilters = (query) => {
  const filters = {};
  const validFilters = ['status', 'type', 'priority', 'customer_id', 'driver_id', 'date_from', 'date_to'];
  
  validFilters.forEach(filter => {
    if (query[filter]) {
      filters[filter] = query[filter];
    }
  });
  
  return filters;
};

// Parse pagination parameters
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

// Parse sorting parameters
const parseSorting = (query, allowedFields = ['created_at']) => {
  let sortBy = 'created_at';
  let sortOrder = 'DESC';
  
  if (query.sort_by && allowedFields.includes(query.sort_by)) {
    sortBy = query.sort_by;
  }
  
  if (query.sort_order && ['ASC', 'DESC'].includes(query.sort_order.toUpperCase())) {
    sortOrder = query.sort_order.toUpperCase();
  }
  
  return { sortBy, sortOrder };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateRandomToken,
  generateJobNumber,
  generateTrackingCode,
  calculateDistance,
  estimateDeliveryTime,
  formatPaginatedResponse,
  formatSuccessResponse,
  formatErrorResponse,
  sanitizeUser,
  generateRandomColor,
  parseFilters,
  parsePagination,
  parseSorting
};

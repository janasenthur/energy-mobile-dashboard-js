const Joi = require('joi');

// Common validation schemas
const commonSchemas = {
  uuid: Joi.string().uuid(),
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')),
  phone: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  })
};

// Auth validation schemas
const authValidation = {
  register: Joi.object({
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    phone: commonSchemas.phone.optional(),
    role: Joi.string().valid('customer', 'driver', 'dispatcher', 'admin').default('customer')
  }),

  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email.required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password.required()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: commonSchemas.password.required()
  })
};

// User validation schemas
const userValidation = {
  updateProfile: Joi.object({
    first_name: Joi.string().min(2).max(50),
    last_name: Joi.string().min(2).max(50),
    phone: commonSchemas.phone,
    preferences: Joi.object()
  }).min(1)
};

// Driver validation schemas
const driverValidation = {
  register: Joi.object({
    user_id: commonSchemas.uuid.required(),
    license_number: Joi.string().required(),
    license_expiry_date: Joi.date().greater('now').required(),
    license_class: Joi.string().max(10),
    emergency_contact: Joi.object(),
    bank_details: Joi.object(),
    work_schedule: Joi.object()
  }),

  updateLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    altitude: Joi.number().optional(),
    accuracy: Joi.number().positive().optional(),
    speed: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional()
  }),

  updateAvailability: Joi.object({
    availability: Joi.string().valid('available', 'busy', 'offline', 'break').required()
  })
};

// Job validation schemas
const jobValidation = {
  create: Joi.object({
    customer_id: commonSchemas.uuid.required(),
    type: Joi.string().valid('delivery', 'pickup', 'emergency', 'scheduled', 'return').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    
    pickup_location: Joi.string().required(),
    pickup_latitude: Joi.number().min(-90).max(90),
    pickup_longitude: Joi.number().min(-180).max(180),
    pickup_contact_name: Joi.string().max(100),
    pickup_contact_phone: commonSchemas.phone,
    pickup_instructions: Joi.string(),
    scheduled_pickup_time: Joi.date().greater('now'),
    
    delivery_location: Joi.string().required(),
    delivery_latitude: Joi.number().min(-90).max(90),
    delivery_longitude: Joi.number().min(-180).max(180),
    delivery_contact_name: Joi.string().max(100),
    delivery_contact_phone: commonSchemas.phone,
    delivery_instructions: Joi.string(),
    scheduled_delivery_time: Joi.date().greater('now'),
    
    cargo_description: Joi.string(),
    cargo_weight: Joi.number().positive(),
    cargo_volume: Joi.number().positive(),
    cargo_value: Joi.number().positive(),
    special_requirements: Joi.string(),
    
    base_price: Joi.number().positive()
  }),

  update: Joi.object({
    type: Joi.string().valid('delivery', 'pickup', 'emergency', 'scheduled', 'return'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    status: Joi.string().valid(
      'pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 
      'picked_up', 'en_route_delivery', 'arrived_delivery', 
      'delivered', 'cancelled', 'on_hold'
    ),
    
    pickup_location: Joi.string(),
    pickup_latitude: Joi.number().min(-90).max(90),
    pickup_longitude: Joi.number().min(-180).max(180),
    pickup_contact_name: Joi.string().max(100),
    pickup_contact_phone: commonSchemas.phone,
    pickup_instructions: Joi.string(),
    scheduled_pickup_time: Joi.date(),
    
    delivery_location: Joi.string(),
    delivery_latitude: Joi.number().min(-90).max(90),
    delivery_longitude: Joi.number().min(-180).max(180),
    delivery_contact_name: Joi.string().max(100),
    delivery_contact_phone: commonSchemas.phone,
    delivery_instructions: Joi.string(),
    scheduled_delivery_time: Joi.date(),
    
    cargo_description: Joi.string(),
    cargo_weight: Joi.number().positive(),
    cargo_volume: Joi.number().positive(),
    cargo_value: Joi.number().positive(),
    special_requirements: Joi.string(),
    
    base_price: Joi.number().positive(),
    additional_charges: Joi.number().min(0),
    completion_notes: Joi.string(),
    customer_rating: Joi.number().integer().min(1).max(5),
    customer_feedback: Joi.string()
  }).min(1),

  assign: Joi.object({
    driver_id: commonSchemas.uuid.required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid(
      'pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 
      'picked_up', 'en_route_delivery', 'arrived_delivery', 
      'delivered', 'cancelled', 'on_hold'
    ).required(),
    location: commonSchemas.coordinates.optional(),
    notes: Joi.string().optional()
  })
};

// Notification validation schemas
const notificationValidation = {
  create: Joi.object({
    title: Joi.string().max(255).required(),
    message: Joi.string().required(),
    type: Joi.string().valid('job', 'payment', 'system', 'emergency', 'message').required(),
    data: Joi.object().default({}),
    priority: Joi.number().integer().min(1).max(4).default(1),
    user_ids: Joi.array().items(commonSchemas.uuid).min(1).required(),
    scheduled_at: Joi.date().greater('now').optional()
  }),

  updateSettings: Joi.object({
    job_notifications: Joi.boolean(),
    payment_notifications: Joi.boolean(),
    system_notifications: Joi.boolean(),
    emergency_notifications: Joi.boolean(),
    message_notifications: Joi.boolean(),
    push_enabled: Joi.boolean(),
    email_enabled: Joi.boolean(),
    sms_enabled: Joi.boolean()
  }).min(1)
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req[property] = value;
    next();
  };
};

module.exports = {
  commonSchemas,
  authValidation,
  userValidation,
  driverValidation,
  jobValidation,
  notificationValidation,
  validate
};

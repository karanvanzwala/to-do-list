import Joi from 'joi';

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
};

// Task validation schemas
export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending').messages({
      'any.only': 'Status must be pending, in_progress, or completed'
    }),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium').messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
    due_date: Joi.date().iso().min('now').optional().messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date cannot be in the past'
    })
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters'
    }),
    description: Joi.string().max(1000).optional().messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional().messages({
      'any.only': 'Status must be pending, in_progress, or completed'
    }),
    priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
      'any.only': 'Priority must be low, medium, or high'
    }),
    due_date: Joi.date().iso().min('now').optional().messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date cannot be in the past'
    })
  })
};

// Validation middleware
export function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
}

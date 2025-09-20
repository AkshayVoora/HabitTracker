import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '@/models';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      data: errors.array()
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};

// User validation rules
export const validateSignup: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters long and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Habit validation rules
export const validateCreateHabit: ValidationChain[] = [
  body('habit_name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Habit name must be 1-100 characters long'),
  body('user_history')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('User history must be less than 1000 characters')
];

// Schedule validation rules
export const validateCreateSchedule: ValidationChain[] = [
  body('habit_id')
    .isUUID()
    .withMessage('Habit ID must be a valid UUID'),
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date in YYYY-MM-DD format'),
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date in YYYY-MM-DD format'),
  body('user_history')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('User history must be less than 1000 characters')
];

// Task completion validation rules
export const validateUpdateTaskCompletion: ValidationChain[] = [
  body('task_id')
    .isUUID()
    .withMessage('Task ID must be a valid UUID'),
  body('is_completed')
    .isBoolean()
    .withMessage('is_completed must be a boolean value'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Notes must be less than 500 characters')
];

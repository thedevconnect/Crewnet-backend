import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));
    
    throw new ApiError(400, 'Validation failed', true, JSON.stringify(errorMessages));
  }
  
  next();
};

export default validateRequest;


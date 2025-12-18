import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to req.user
 * Assumes token contains emp_id field
 */
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token missing. Please provide Authorization header'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token not found in Authorization header'
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    // Assumes token contains emp_id (or userId which maps to emp_id)
    req.user = {
      ...decoded,
      emp_id: decoded.emp_id || decoded.userId || decoded.id // Support multiple token formats
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

export default verifyToken;


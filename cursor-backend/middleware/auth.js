import jwt from 'jsonwebtoken';

// JWT Token Verification Middleware
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: 'Token missing. Please provide Authorization header'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Token not found in Authorization header'
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: false,
        message: 'JWT_SECRET not configured'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      status: false,
      message: 'Token verification failed'
    });
  }
};

export default verifyToken;


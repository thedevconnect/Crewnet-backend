import ApiResponse from '../utils/ApiResponse.js';

/**
 * Middleware to check if user is SuperAdmin
 * Must be used after verifyToken middleware
 */
export const requireSuperAdmin = (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.isSuperAdmin || false;
    
    if (!isSuperAdmin) {
      return res.status(403).json(
        ApiResponse.error('Access denied. SuperAdmin privileges required.', 403)
      );
    }
    
    next();
  } catch (error) {
    return res.status(401).json(
      ApiResponse.error('Authentication required', 401)
    );
  }
};

export default requireSuperAdmin;


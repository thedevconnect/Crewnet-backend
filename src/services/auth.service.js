import UserModel from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

class AuthService {
  // Register - Create new user
  async register(data) {
    const { name, email, password } = data;

    // Basic validation - simple check
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'This email is already registered');
    }

    // Save password directly (plain text)
    const user = await UserModel.create({ name, email, password });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Login - Authenticate user
  async login(email, password) {
    // Basic validation
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user from database
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password (direct comparison - plain text)
    if (password !== user.password) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, 'Server configuration error');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  // Profile - Get user details
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

export default new AuthService();


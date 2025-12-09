import UserModel from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

class AuthService {
  // Register - Naya user banane ke liye
  async register(data) {
    const { name, email, password } = data;

    // Basic validation - simple check
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email aur password required hai');
    }

    // Email already hai ya nahi check karo
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'Ye email pehle se registered hai');
    }

    // Password directly save karo (plain text)
    const user = await UserModel.create({ name, email, password });

    // Password ko response se hata do
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Login - User ko authenticate karne ke liye
  async login(email, password) {
    // Basic validation
    if (!email || !password) {
      throw new ApiError(400, 'Email aur password required hai');
    }

    // Database se user find karo
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email ya password');
    }

    // Password verify karo (direct comparison - plain text)
    if (password !== user.password) {
      throw new ApiError(401, 'Invalid email ya password');
    }

    // JWT token generate karo
    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, 'Server configuration error');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Password ko response se hata do
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  // Profile - User ki details get karne ke liye
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

export default new AuthService();


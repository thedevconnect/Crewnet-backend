import db from '../config/db.js';

class UserModel {
  // Find user by email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Create new user
  static async create(data) {
    const { name, email, password } = data;
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return this.findById(result.insertId);
  }

  // Update user
  static async update(id, data) {
    const { name, email, password } = data;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (password) {
      updates.push('password = ?');
      params.push(password);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    return this.findById(id);
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get all users (for admin purposes)
  static async findAll(limit = 10, offset = 0) {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }
}

export default UserModel;


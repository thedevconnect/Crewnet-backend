import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// POST /employee/add (Cursor Based Insert)
// ============================================
router.post('/add', async (req, res) => {
  try {
    const { full_name, email, mobile, designation, join_date } = req.body;

    // Validation
    if (!full_name || !email || !mobile || !designation || !join_date) {
      return res.status(400).json({
        status: false,
        message: 'All fields are required: full_name, email, mobile, designation, join_date'
      });
    }

    // Step 1: Insert data into emp_buffer
    await db.execute(
      'INSERT INTO emp_buffer (full_name, email, mobile, designation, join_date) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, mobile, designation, join_date]
    );

    // Step 2: Call stored procedure sp_add_employee_cur()
    await db.execute('CALL sp_add_employee_cur()');

    // Step 3: Return success response
    res.status(200).json({
      status: true,
      message: 'Employee added successfully'
    });
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to add employee'
    });
  }
});

// ============================================
// GET /dashboard/employee-count
// ============================================
router.get('/employee-count', async (req, res) => {
  try {
    // Call stored procedure sp_employee_count()
    const [results] = await db.execute('CALL sp_employee_count()');
    
    const totalEmployees = results[0][0]?.totalEmployees || 0;

    res.status(200).json({
      status: true,
      message: 'Employee count fetched successfully',
      data: {
        totalEmployees: totalEmployees
      }
    });
  } catch (error) {
    console.error('Get employee count error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to get employee count'
    });
  }
});

// ============================================
// GET /dashboard/employees
// ============================================
router.get('/employees', async (req, res) => {
  try {
    // Call stored procedure sp_employee_list()
    const [results] = await db.execute('CALL sp_employee_list()');
    
    const employees = results[0] || [];

    res.status(200).json({
      status: true,
      message: 'Employees fetched successfully',
      data: {
        employees: employees
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to get employees'
    });
  }
});

export default router;


# Cursor-Based Backend with MySQL Stored Procedures

Complete Node.js backend using MySQL Stored Procedures and Cursors.

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL file in MySQL:

```bash
mysql -u root -p < ../database_setup.sql
```

Or use MySQL Workbench/SQLyog to execute `database_setup.sql`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=crewnet_cursor
DB_PORT=3306
PORT=3000
JWT_SECRET=your-secret-key
```

### 4. Start Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📡 API Endpoints

### 1. POST /employee/add
Add employee using cursor-based stored procedure.

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "designation": "Developer",
  "join_date": "2024-01-15"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Employee added successfully"
}
```

### 2. GET /dashboard/employee-count
Get total employee count.

**Response:**
```json
{
  "status": true,
  "message": "Employee count fetched successfully",
  "data": {
    "totalEmployees": 10
  }
}
```

### 3. GET /dashboard/employees
Get all employees list.

**Response:**
```json
{
  "status": true,
  "message": "Employees fetched successfully",
  "data": {
    "employees": [
      {
        "emp_id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "mobile": "1234567890",
        "designation": "Developer",
        "join_date": "2024-01-15",
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

## 🔐 JWT Middleware

Use `verifyToken` middleware for protected routes:

```javascript
import { verifyToken } from './middleware/auth.js';

router.get('/protected', verifyToken, (req, res) => {
  // req.user contains decoded token data
  res.json({ status: true, user: req.user });
});
```

## 📁 Project Structure

```
cursor-backend/
├── server.js           # Main server file
├── db.js              # Database connection
├── package.json       # Dependencies
├── .env.example       # Environment template
├── routes/
│   └── employee.js   # Employee routes
└── middleware/
    └── auth.js       # JWT authentication
```

## ✅ Features

- ✅ MySQL Stored Procedures
- ✅ Cursor-based data processing
- ✅ JWT Authentication Middleware
- ✅ Express Router
- ✅ Error Handling
- ✅ Standardized JSON Response Format

## 🧪 Testing with cURL

### Add Employee
```bash
curl.exe -X POST "http://localhost:3000/employee/add" ^
  -H "Content-Type: application/json" ^
  --data "{\"full_name\":\"John Doe\",\"email\":\"john@example.com\",\"mobile\":\"1234567890\",\"designation\":\"Developer\",\"join_date\":\"2024-01-15\"}"
```

### Get Employee Count
```bash
curl.exe "http://localhost:3000/dashboard/employee-count"
```

### Get Employees List
```bash
curl.exe "http://localhost:3000/dashboard/employees"
```

## 📝 Notes

- All stored procedures are created in `database_setup.sql`
- Cursor-based insertion uses `emp_buffer` table
- JWT middleware is ready but not applied to routes (add `verifyToken` if needed)
- Response format is standardized: `{ status, message, data }`


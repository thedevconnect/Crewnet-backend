# Attendance API Implementation

## Overview
This document describes the implementation of Swipe In and Swipe Out attendance APIs for the crewnet-backend project.

---

## 📋 Files Created

1. **`src/database/attendance.sql`** - SQL table creation script
2. **`src/routes/attendance.routes.js`** - Attendance API routes
3. **`src/middlewares/auth.middleware.js`** - JWT authentication middleware (if not already exists)

---

## 🗄️ Database Setup

### SQL Table Creation

Run the following SQL script to create the attendance table:

```sql
-- File: src/database/attendance.sql

USE crewnet;

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  swipe_in_time DATETIME,
  swipe_out_time DATETIME,
  status ENUM('IN', 'OUT') DEFAULT 'IN',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp_id (emp_id),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_status (status),
  UNIQUE KEY unique_emp_date (emp_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key Features:**
- `UNIQUE(emp_id, attendance_date)` - Prevents duplicate entries for same employee on same date
- `status` ENUM('IN', 'OUT') - Tracks current attendance status
- Indexes on `emp_id`, `attendance_date`, and `status` for better query performance

---

## 🔌 API Endpoints

### Base URL
All attendance APIs are under `/api/attendance` and require JWT authentication.

### Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The middleware extracts `emp_id` from `req.user.emp_id` (or falls back to `req.user.userId` or `req.user.id`).

---

### 1. POST /api/attendance/swipe-in

**Description:** Swipe in for the current day

**Request:**
```http
POST /api/attendance/swipe-in
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Swiped in successfully",
  "data": {
    "id": 1,
    "emp_id": 123,
    "attendance_date": "2024-01-15",
    "swipe_in_time": "2024-01-15T09:00:00.000Z",
    "status": "IN"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Already swiped in"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Employee ID not found. Please ensure you are authenticated."
}
```

**Logic:**
- Checks if attendance record exists for today
- If exists → returns error "Already swiped in"
- If not → inserts record with `swipe_in_time = NOW()`, `status = 'IN'`

---

### 2. POST /api/attendance/swipe-out

**Description:** Swipe out for the current day

**Request:**
```http
POST /api/attendance/swipe-out
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Swiped out successfully",
  "data": {
    "id": 1,
    "emp_id": 123,
    "attendance_date": "2024-01-15",
    "swipe_in_time": "2024-01-15T09:00:00.000Z",
    "swipe_out_time": "2024-01-15T18:00:00.000Z",
    "status": "OUT"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Swipe in not found"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Already swiped out"
}
```

**Logic:**
- Finds today's attendance record
- If not found → error "Swipe in not found"
- If `swipe_out_time` already exists → error "Already swiped out"
- Else → updates `swipe_out_time = NOW()`, `status = 'OUT'`

---

### 3. GET /api/attendance/today-status

**Description:** Get today's attendance status and available actions

**Request:**
```http
GET /api/attendance/today-status
Authorization: Bearer <token>
```

**Response (Success - 200):**

**Case 1: No record exists**
```json
{
  "success": true,
  "message": "Today's attendance status fetched successfully",
  "data": {
    "canSwipeIn": true,
    "canSwipeOut": false,
    "attendance": null
  }
}
```

**Case 2: Swiped in but not out**
```json
{
  "success": true,
  "message": "Today's attendance status fetched successfully",
  "data": {
    "canSwipeIn": false,
    "canSwipeOut": true,
    "attendance": {
      "id": 1,
      "emp_id": 123,
      "attendance_date": "2024-01-15",
      "swipe_in_time": "2024-01-15T09:00:00.000Z",
      "swipe_out_time": null,
      "status": "IN"
    }
  }
}
```

**Case 3: Already swiped out**
```json
{
  "success": true,
  "message": "Today's attendance status fetched successfully",
  "data": {
    "canSwipeIn": false,
    "canSwipeOut": false,
    "attendance": {
      "id": 1,
      "emp_id": 123,
      "attendance_date": "2024-01-15",
      "swipe_in_time": "2024-01-15T09:00:00.000Z",
      "swipe_out_time": "2024-01-15T18:00:00.000Z",
      "status": "OUT"
    }
  }
}
```

**Logic:**
- If no record → `canSwipeIn = true`, `canSwipeOut = false`
- If `status = 'IN'` and no `swipe_out_time` → `canSwipeOut = true`
- If `status = 'OUT'` → both `false`

---

## 🔧 Implementation Details

### Route Registration in app.js

The attendance routes are registered with JWT authentication middleware:

```javascript
// File: src/app.js

import attendanceRoutes from './routes/attendance.routes.js';
import { verifyToken } from './middlewares/auth.middleware.js';

// Register attendance routes with authentication
app.use('/api/attendance', verifyToken, attendanceRoutes);
```

### JWT Middleware

The middleware (`src/middlewares/auth.middleware.js`) extracts `emp_id` from the JWT token. It supports multiple token formats:
- `req.user.emp_id` (primary)
- `req.user.userId` (fallback)
- `req.user.id` (fallback)

**Important:** Ensure your JWT token includes `emp_id` when generating tokens during login. Update your login API to include `emp_id` in the JWT payload:

```javascript
// Example: In your login route
const token = jwt.sign(
  {
    userId: user.id,
    emp_id: user.emp_id || user.id, // Add emp_id
    email: user.email,
    name: user.name
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## 📝 Usage Examples

### Using cURL

**Swipe In:**
```bash
curl -X POST http://localhost:3000/api/attendance/swipe-in \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Swipe Out:**
```bash
curl -X POST http://localhost:3000/api/attendance/swipe-out \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Get Today Status:**
```bash
curl -X GET http://localhost:3000/api/attendance/today-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Swipe In
async function swipeIn() {
  const response = await fetch(`${API_BASE}/attendance/swipe-in`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
}

// Swipe Out
async function swipeOut() {
  const response = await fetch(`${API_BASE}/attendance/swipe-out`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
}

// Get Today Status
async function getTodayStatus() {
  const response = await fetch(`${API_BASE}/attendance/today-status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data);
}
```

---

## ✅ Testing Checklist

- [ ] Run SQL script to create attendance table
- [ ] Verify table structure with `DESCRIBE attendance;`
- [ ] Test swipe-in without existing record (should succeed)
- [ ] Test swipe-in with existing record (should return "Already swiped in")
- [ ] Test swipe-out without swipe-in (should return "Swipe in not found")
- [ ] Test swipe-out after swipe-in (should succeed)
- [ ] Test swipe-out after already swiped out (should return "Already swiped out")
- [ ] Test today-status with no record (canSwipeIn = true)
- [ ] Test today-status after swipe-in (canSwipeOut = true)
- [ ] Test today-status after swipe-out (both false)
- [ ] Verify JWT authentication works on all endpoints

---

## 🐛 Error Handling

All endpoints include comprehensive error handling:
- **401 Unauthorized** - Missing or invalid JWT token
- **400 Bad Request** - Business logic errors (already swiped in/out)
- **404 Not Found** - Swipe in record not found
- **500 Internal Server Error** - Database or server errors

Error responses follow consistent format:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (only in development mode)"
}
```

---

## 📌 Notes

1. **Date Handling:** All dates are stored in MySQL DATE format (YYYY-MM-DD). The `getTodayDate()` helper function ensures consistent date formatting.

2. **Time Zones:** `NOW()` uses MySQL server timezone. Ensure your server timezone is correctly configured.

3. **UNIQUE Constraint:** The `UNIQUE(emp_id, attendance_date)` constraint prevents duplicate entries. If a duplicate insert is attempted, MySQL will throw `ER_DUP_ENTRY` error, which is caught and returned as "Already swiped in".

4. **JWT Token Format:** Ensure your login API includes `emp_id` in the JWT token payload for the attendance APIs to work correctly.

---

## 🚀 Next Steps

1. Run the SQL script to create the attendance table
2. Update your login API to include `emp_id` in JWT token (if not already present)
3. Test all endpoints using Postman or cURL
4. Integrate with your frontend application

---

## 📄 Files Summary

| File | Purpose |
|------|---------|
| `src/database/attendance.sql` | SQL table creation script |
| `src/routes/attendance.routes.js` | Attendance API routes implementation |
| `src/middlewares/auth.middleware.js` | JWT authentication middleware |
| `src/app.js` | Route registration (updated) |


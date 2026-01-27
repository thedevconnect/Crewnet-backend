# HRMS Backend API Documentation

## Overview

Production-ready HRMS backend with Role-Based Access Control (RBAC), Attendance Management, Calendar, and Dashboard Analytics.

**Base URL**: `http://localhost:3000/api`

---

## 1. ATTENDANCE MODULE

### POST /api/attendance/swipe-in

Record employee swipe-in with IP address and device tracking.

**Request:**
```json
{
  "employeeId": 1,
  "location": "Office Main Gate",
  "ipAddress": "192.168.1.100",
  "deviceInfo": "Chrome on Windows",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Swipe In Successful",
  "success": true,
  "data": {
    "id": 123,
    "employeeId": 1,
    "attendanceDate": "2026-01-24",
    "swipeInTime": "2026-01-24T09:15:00.000Z",
    "swipeInLocation": "Office Main Gate",
    "ipAddress": "192.168.1.100",
    "deviceInfo": "Chrome on Windows",
    "lateEntry": false,
    "status": "IN"
  }
}
```

**Validation:**
- Prevents multiple swipe-ins without swipe-out
- Calculates late entry flag (after 9:30 AM)
- Stores IP address and device info

---

### POST /api/attendance/swipe-out

Record employee swipe-out.

**Request:**
```json
{
  "employeeId": 1,
  "location": "Office Main Gate"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Swipe Out Successful",
  "success": true,
  "data": {
    "id": 123,
    "employeeId": 1,
    "swipeInTime": "2026-01-24T09:15:00.000Z",
    "swipeOutTime": "2026-01-24T18:30:00.000Z",
    "earlyExit": false,
    "duration": {
      "hours": 9,
      "minutes": 15,
      "formatted": "9h 15m"
    },
    "status": "OUT"
  }
}
```

**Validation:**
- Requires swipe-in before swipe-out
- Calculates early exit flag (before 6:00 PM)

---

### GET /api/attendance/today/:employeeId

Get today's attendance records for an employee.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Today attendance fetched successfully",
  "success": true,
  "data": {
    "status": "IN",
    "records": [
      {
        "id": 123,
        "employeeId": 1,
        "swipeInTime": "2026-01-24T09:15:00.000Z",
        "swipeInLocation": "Office Main Gate",
        "swipeOutTime": null,
        "lateEntry": false,
        "status": "IN"
      }
    ],
    "totalRecords": 1,
    "totalTime": {
      "hours": 0,
      "minutes": 0,
      "formatted": "0h 0m"
    },
    "lastSwipeIn": "2026-01-24T09:15:00.000Z",
    "lastSwipeOut": null
  }
}
```

---

## 2. CALENDAR MODULE

### GET /api/calendar?employeeId={id}&month={YYYY-MM}

Get employee calendar with day-wise attendance status.

**Query Parameters:**
- `employeeId` (required): Employee ID
- `month` (required): Month in YYYY-MM format

**Response:**
```json
{
  "statusCode": 200,
  "message": "Calendar fetched successfully",
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "employeeCode": "EMP001",
      "name": "John Doe"
    },
    "month": {
      "year": 2026,
      "month": 1,
      "monthName": "January"
    },
    "summary": {
      "totalDays": 31,
      "present": 20,
      "absent": 5,
      "leave": 3,
      "holiday": 2,
      "weekend": 8
    },
    "days": [
      {
        "date": "2026-01-01",
        "day": 1,
        "dayOfWeek": "Wednesday",
        "status": "Holiday",
        "statusCode": "H",
        "details": {
          "holidayName": "New Year",
          "holidayType": "National"
        }
      },
      {
        "date": "2026-01-02",
        "day": 2,
        "dayOfWeek": "Thursday",
        "status": "Present",
        "statusCode": "P",
        "details": {
          "swipeInTime": "2026-01-02T09:15:00.000Z",
          "swipeOutTime": "2026-01-02T18:30:00.000Z",
          "lateEntry": false,
          "earlyExit": false
        }
      },
      {
        "date": "2026-01-03",
        "day": 3,
        "dayOfWeek": "Friday",
        "status": "Leave",
        "statusCode": "CL",
        "details": {
          "leaveType": "CL",
          "status": "approved"
        }
      },
      {
        "date": "2026-01-04",
        "day": 4,
        "dayOfWeek": "Saturday",
        "status": "Weekend",
        "statusCode": "W"
      },
      {
        "date": "2026-01-05",
        "day": 5,
        "dayOfWeek": "Sunday",
        "status": "Absent",
        "statusCode": "A"
      }
    ]
  }
}
```

**Status Codes:**
- `H` - Holiday
- `P` - Present
- `A` - Absent
- `L/CL/SL/PL` - Leave (Casual/Sick/Personal)
- `W` - Weekend

---

## 3. DASHBOARD MODULE (Role-Aware)

### GET /api/dashboard

Get comprehensive dashboard data based on user role.

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (YYYY)
- `date` (optional): Specific date (YYYY-MM-DD)

**Role-Based Access:**
- **ESS**: Only own data
- **HR Admin**: Department data
- **Super Admin**: All data

**Response (Super Admin):**
```json
{
  "statusCode": 200,
  "message": "Dashboard data fetched successfully",
  "success": true,
  "data": {
    "role": "SUPER_ADMIN",
    "scope": "ALL",
    "summary": {
      "todayPresent": 150,
      "todayAbsent": 20,
      "lateEmployees": 5,
      "leaveCount": 10
    },
    "lateEmployees": [
      {
        "employeeId": 5,
        "employeeCode": "EMP005",
        "name": "Jane Smith",
        "department": "IT",
        "swipeInTime": "2026-01-24T09:45:00.000Z",
        "swipeInTimeOnly": "09:45:00"
      }
    ],
    "dayWise": [
      {
        "date": "2026-01-24",
        "presentCount": 150,
        "lateCount": 5,
        "earlyExitCount": 2
      }
    ],
    "monthly": {
      "month": 1,
      "year": 2026,
      "uniqueEmployees": 170,
      "workingDays": 22,
      "totalSwipeIns": 3740,
      "totalLateEntries": 150,
      "totalEarlyExits": 80,
      "avgWorkingMinutes": 540
    }
  }
}
```

**Response (ESS - Employee):**
```json
{
  "statusCode": 200,
  "message": "Dashboard data fetched successfully",
  "success": true,
  "data": {
    "role": "ESS",
    "scope": "EMPLOYEE",
    "summary": {
      "todayPresent": 1,
      "todayAbsent": 0,
      "lateEmployees": 0,
      "leaveCount": 0
    },
    "lateEmployees": [],
    "dayWise": [
      {
        "date": "2026-01-24",
        "presentCount": 1,
        "lateCount": 0,
        "earlyExitCount": 0
      }
    ],
    "monthly": {
      "month": 1,
      "year": 2026,
      "uniqueEmployees": 1,
      "workingDays": 22,
      "totalSwipeIns": 22,
      "totalLateEntries": 2,
      "totalEarlyExits": 1,
      "avgWorkingMinutes": 540
    }
  }
}
```

---

### GET /api/dashboard/day-wise

Get day-wise statistics for selected period.

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (YYYY)
- `date` (optional): Specific date (YYYY-MM-DD)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Day-wise statistics fetched successfully",
  "success": true,
  "data": [
    {
      "date": "2026-01-01",
      "presentCount": 0,
      "lateCount": 0,
      "earlyExitCount": 0
    },
    {
      "date": "2026-01-02",
      "presentCount": 150,
      "lateCount": 5,
      "earlyExitCount": 2
    }
  ]
}
```

---

### GET /api/dashboard/monthly

Get monthly statistics.

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (YYYY)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Monthly statistics fetched successfully",
  "success": true,
  "data": {
    "month": 1,
    "year": 2026,
    "uniqueEmployees": 170,
    "workingDays": 22,
    "totalSwipeIns": 3740,
    "totalLateEntries": 150,
    "totalEarlyExits": 80,
    "avgWorkingMinutes": 540
  }
}
```

---

## 4. RBAC MODULE

### GET /api/rbac/roles

Get all active roles.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Roles fetched successfully",
  "success": true,
  "data": [
    {
      "id": 1,
      "role_name": "Super Admin",
      "role_code": "SUPER_ADMIN",
      "description": "Full system access",
      "status": "Active"
    },
    {
      "id": 2,
      "role_name": "HR Admin",
      "role_code": "HR_ADMIN",
      "description": "HR administration access",
      "status": "Active"
    }
  ]
}
```

---

### GET /api/rbac/roles/:roleId/menus

Get menus and submenus for a role (by ID).

**Response:**
```json
{
  "statusCode": 200,
  "message": "Menus fetched successfully",
  "success": true,
  "data": {
    "role": {
      "id": 2,
      "roleName": "HR Admin",
      "roleCode": "HR_ADMIN"
    },
    "menus": [
      {
        "id": 1,
        "menuName": "Dashboard",
        "menuCode": "DASHBOARD",
        "menuIcon": "fa-dashboard",
        "menuPath": "/dashboard",
        "displayOrder": 1,
        "subMenus": [
          {
            "id": 1,
            "subMenuName": "View Dashboard",
            "subMenuCode": "DASHBOARD_VIEW",
            "subMenuPath": "/dashboard"
          }
        ]
      }
    ]
  }
}
```

---

### GET /api/rbac/roles/code/:roleCode/menus

Get menus and submenus for a role (by code).

**Example:** `/api/rbac/roles/code/ESS/menus`

**Response:** Same structure as above.

---

## Database Schema

### Attendance Table
```sql
CREATE TABLE attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  emp_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  swipe_in_time DATETIME,
  swipe_out_time DATETIME,
  swipe_in_location VARCHAR(255),
  swipe_out_location VARCHAR(255),
  ip_address VARCHAR(45),
  device_info TEXT,
  user_agent TEXT,
  late_entry BOOLEAN DEFAULT FALSE,
  early_exit BOOLEAN DEFAULT FALSE,
  status ENUM('IN', 'OUT') DEFAULT 'IN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_emp_date (emp_id, attendance_date),
  INDEX idx_late_entry (late_entry),
  INDEX idx_early_exit (early_exit)
);
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "data": null
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `404` - Not Found (employee/role not found)
- `500` - Internal Server Error

---

## Authentication

All endpoints (except public ones) require authentication token in header:

```
Authorization: Bearer <token>
```

User context is extracted from token and available in `req.user`:
- `req.user.roleCode` - User's role code
- `req.user.employeeId` - User's employee ID
- `req.user.department` - User's department (for HR Admin)

---

## Setup Instructions

1. **Run Database Schema:**
```bash
mysql -u root -p crewnet < src/database/hrms_complete_schema.sql
mysql -u root -p crewnet < src/database/attendance_enhancement_migration.sql
```

2. **Insert Sample Data:**
```bash
mysql -u root -p crewnet < src/database/rbac_sample_data.sql
```

3. **Start Server:**
```bash
npm start
```

---

## Performance Optimizations

- **Indexes**: All foreign keys and frequently queried columns are indexed
- **Parallel Queries**: Dashboard uses Promise.all for parallel data fetching
- **Efficient Joins**: Only necessary joins, no over-engineering
- **Query Optimization**: Uses WHERE clauses to limit data scope by role

---

## Notes

- All timestamps are in UTC
- Date formats: YYYY-MM-DD for dates, YYYY-MM for months
- Late entry threshold: 9:30 AM (configurable)
- Early exit threshold: 6:00 PM (configurable)
- Role-based access is enforced at service layer

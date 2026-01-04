# Attendance Management API - Complete Documentation

## Base URL: `http://localhost:3000/api/attendance`

---

## 1. POST /api/attendance/swipe-in
**Swipe in for an employee**

### Request:
```bash
curl -X POST http://localhost:3000/api/attendance/swipe-in \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1
  }'
```

### Response (Success):
```json
{
  "success": true,
  "message": "Swipe In Successful",
  "data": {
    "id": 1,
    "employee_id": 1,
    "swipe_in_time": "2024-01-15T09:30:00.000Z",
    "status": "IN"
  }
}
```

### Response (Error - Already Swiped In):
```json
{
  "success": false,
  "error": "Already swiped in. Please swipe out first."
}
```

### Response (Error - Employee Not Found):
```json
{
  "success": false,
  "error": "Employee not found"
}
```

---

## 2. POST /api/attendance/swipe-out
**Swipe out for an employee**

### Request:
```bash
curl -X POST http://localhost:3000/api/attendance/swipe-out \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": 1
  }'
```

### Response (Success):
```json
{
  "success": true,
  "message": "Swipe Out Successful",
  "data": {
    "id": 1,
    "employee_id": 1,
    "swipe_in_time": "2024-01-15T09:30:00.000Z",
    "swipe_out_time": "2024-01-15T18:00:00.000Z",
    "duration": "8h 30m",
    "status": "OUT"
  }
}
```

### Response (Error - Must Swipe In First):
```json
{
  "success": false,
  "error": "Please swipe in first"
}
```

---

## 3. GET /api/attendance/today/:employeeId
**Get today's attendance record for an employee**

### Request:
```bash
curl -X GET http://localhost:3000/api/attendance/today/1
```

### Response (With Records):
```json
{
  "success": true,
  "status": "OUT",
  "records": [
    {
      "id": 1,
      "employee_id": 123,
      "swipe_in_time": "2024-01-15T09:30:00.000Z",
      "swipe_out_time": "2024-01-15T12:00:00.000Z",
      "status": "OUT",
      "duration": "2h 30m",
      "created_at": "2024-01-15T09:30:00.000Z"
    },
    {
      "id": 2,
      "employee_id": 123,
      "swipe_in_time": "2024-01-15T13:00:00.000Z",
      "swipe_out_time": "2024-01-15T18:00:00.000Z",
      "status": "OUT",
      "duration": "5h 0m",
      "created_at": "2024-01-15T13:00:00.000Z"
    }
  ],
  "total_records": 2,
  "total_time": {
    "hours": 7,
    "minutes": 30,
    "formatted": "7h 30m"
  },
  "last_swipe_in": "2024-01-15T13:00:00.000Z",
  "last_swipe_out": "2024-01-15T18:00:00.000Z"
}
```

### Response (Currently Swiped In):
```json
{
  "success": true,
  "status": "IN",
  "records": [
    {
      "id": 1,
      "employee_id": 123,
      "swipe_in_time": "2024-01-15T09:30:00.000Z",
      "swipe_out_time": "2024-01-15T12:00:00.000Z",
      "status": "OUT",
      "duration": "2h 30m",
      "created_at": "2024-01-15T09:30:00.000Z"
    },
    {
      "id": 2,
      "employee_id": 123,
      "swipe_in_time": "2024-01-15T13:00:00.000Z",
      "swipe_out_time": null,
      "status": "IN",
      "duration": null,
      "created_at": "2024-01-15T13:00:00.000Z"
    }
  ],
  "total_records": 2,
  "total_time": {
    "hours": 2,
    "minutes": 30,
    "formatted": "2h 30m"
  },
  "last_swipe_in": "2024-01-15T13:00:00.000Z",
  "last_swipe_out": null
}
```

### Response (Not Swiped):
```json
{
  "success": true,
  "status": "NOT_SWIPED",
  "records": [],
  "total_time": {
    "hours": 0,
    "minutes": 0,
    "formatted": "0h 0m"
  }
}
```

---

## Business Rules Implemented:

1. ✅ **Multiple swipe in/out allowed** - Employee can swipe in/out multiple times per day
2. ✅ **Must swipe in before swipe out** - Checks for latest IN record without swipe_out_time before allowing swipe out
3. ✅ **Duration calculation** - Automatically calculates duration for each swipe in/out pair (format: "Xh Ym")
4. ✅ **Total time calculation** - Calculates total time spent (sum of all swipe in/out durations)
5. ✅ **Current date tracking** - Uses today's date for attendance_date
6. ✅ **Employee validation** - Validates employeeId exists before processing
7. ✅ **All records tracking** - GET API returns all swipe in/out records for the day

---

## Error Handling:

All errors return:
```json
{
  "success": false,
  "error": "error message"
}
```

### Common Errors:

- `400 Bad Request`: 
  - "employeeId is required"
  - "employeeId must be a valid number"
  - "Already swiped in"
  - "Please swipe in first"

- `404 Not Found`:
  - "Employee not found"

- `500 Internal Server Error`:
  - Generic server errors

---

## Database Schema:

The API uses the following table structure:

```sql
CREATE TABLE attendance (
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
  INDEX idx_status (status)
);
```

**Note:** UNIQUE constraint on (emp_id, attendance_date) has been removed to allow multiple swipe in/out records per day.

### Migration Script:

Run `ATTENDANCE_MULTIPLE_SWIPES_MIGRATION.sql` to remove the UNIQUE constraint:
```sql
ALTER TABLE attendance DROP INDEX IF EXISTS unique_emp_date;
```

---

## Field Mapping:

- **Request**: `employeeId` (number in request body)
- **Database**: `emp_id` (stored in database)
- **Response**: `employee_id` (returned in response for consistency)

---

## Testing Flow:

1. **Check today's status:**
   ```bash
   curl -X GET http://localhost:3000/api/attendance/today/1
   ```
   Expected: `{ "success": true, "status": "NOT_SWIPED" }`

2. **Swipe in:**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/swipe-in \
     -H "Content-Type: application/json" \
     -d '{"employeeId": 1}'
   ```
   Expected: Success with swipe_in_time

3. **Check status again:**
   ```bash
   curl -X GET http://localhost:3000/api/attendance/today/1
   ```
   Expected: `{ "success": true, "status": "IN", ... }`

4. **Try to swipe in again (should fail):**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/swipe-in \
     -H "Content-Type: application/json" \
     -d '{"employeeId": 1}'
   ```
   Expected: `{ "success": false, "error": "Already swiped in" }`

5. **Swipe out:**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/swipe-out \
     -H "Content-Type: application/json" \
     -d '{"employeeId": 1}'
   ```
   Expected: Success with duration calculated

6. **Check final status:**
   ```bash
   curl -X GET http://localhost:3000/api/attendance/today/1
   ```
   Expected: `{ "success": true, "status": "OUT", ... }`

---

## Notes:

- All times are in UTC format
- Duration is calculated in hours and minutes (e.g., "8h 30m")
- **Multiple swipe in/out allowed** - Each swipe creates/updates a separate record
- Total time is sum of all completed swipe in/out pairs
- Status automatically updates: 'IN' on swipe-in, 'OUT' on swipe-out
- GET API returns all records for the day with total time calculation
- Records are sorted by swipe_in_time (oldest first)


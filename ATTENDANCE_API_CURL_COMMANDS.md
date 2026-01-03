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
  "error": "Already swiped in"
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

### Response (Swiped In):
```json
{
  "success": true,
  "status": "IN",
  "swipe_in_time": "2024-01-15T09:30:00.000Z",
  "swipe_out_time": null,
  "employee_id": 1,
  "id": 1
}
```

### Response (Swiped Out):
```json
{
  "success": true,
  "status": "OUT",
  "swipe_in_time": "2024-01-15T09:30:00.000Z",
  "swipe_out_time": "2024-01-15T18:00:00.000Z",
  "employee_id": 1,
  "id": 1
}
```

### Response (Not Swiped):
```json
{
  "success": true,
  "status": "NOT_SWIPED"
}
```

---

## Business Rules Implemented:

1. ✅ **One swipe in per day** - If employee already swiped in (status='IN' with no swipe_out_time), returns error
2. ✅ **Must swipe in before swipe out** - Checks for existing record with status='IN' before allowing swipe out
3. ✅ **Duration calculation** - Automatically calculates duration on swipe out (format: "Xh Ym")
4. ✅ **Current date tracking** - Uses today's date for attendance_date
5. ✅ **Employee validation** - Validates employeeId exists before processing

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
  UNIQUE KEY unique_emp_date (emp_id, attendance_date)
);
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
- One attendance record per employee per day (UNIQUE constraint)
- Status automatically updates: 'IN' on swipe-in, 'OUT' on swipe-out


# Leaves API - Complete CRUD Operations
## Base URL: `http://localhost:3000/api/leaves`

---

## 1. CREATE Leave (POST)
**Create a new leave request**

```bash
curl -X POST http://localhost:3000/api/leaves \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2024-01-15",
    "toDate": "2024-01-16",
    "sessionFrom": "First Half",
    "sessionTo": "Second Half",
    "leaveType": "Sick Leave",
    "reason": "Not feeling well",
    "ccTo": "manager@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_date": "2024-01-15",
    "to_date": "2024-01-16",
    "session_from": "First Half",
    "session_to": "Second Half",
    "leave_type": "Sick Leave",
    "reason": "Not feeling well",
    "cc_to": "manager@example.com",
    "created_at": "2024-01-10T10:30:00.000Z"
  }
}
```

---

## 2. GET All Leaves (GET)
**Get all leaves with pagination and search**

```bash
# Get all leaves (default pagination)
curl -X GET http://localhost:3000/api/leaves

# With pagination
curl -X GET "http://localhost:3000/api/leaves?page=1&limit=10"

# With search
curl -X GET "http://localhost:3000/api/leaves?search=Sick"

# With sorting
curl -X GET "http://localhost:3000/api/leaves?sortBy=from_date&sortOrder=ASC"

# Combined parameters
curl -X GET "http://localhost:3000/api/leaves?page=1&limit=5&search=Leave&sortBy=created_at&sortOrder=DESC"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": 1,
        "from_date": "2024-01-15",
        "to_date": "2024-01-16",
        "session_from": "First Half",
        "session_to": "Second Half",
        "leave_type": "Sick Leave",
        "reason": "Not feeling well",
        "cc_to": "manager@example.com",
        "created_at": "2024-01-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## 3. GET Leave by ID (GET)
**Get a specific leave by ID**

```bash
curl -X GET http://localhost:3000/api/leaves/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_date": "2024-01-15",
    "to_date": "2024-01-16",
    "session_from": "First Half",
    "session_to": "Second Half",
    "leave_type": "Sick Leave",
    "reason": "Not feeling well",
    "cc_to": "manager@example.com",
    "created_at": "2024-01-10T10:30:00.000Z"
  }
}
```

**Error Response (if not found):**
```json
{
  "success": false,
  "error": "Leave not found"
}
```

---

## 4. UPDATE Leave (PUT)
**Update an existing leave**

```bash
curl -X PUT http://localhost:3000/api/leaves/1 \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2024-01-20",
    "toDate": "2024-01-21",
    "leaveType": "Personal Leave",
    "reason": "Family function"
  }'
```

**Partial Update (only update specific fields):**
```bash
curl -X PUT http://localhost:3000/api/leaves/1 \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Updated reason for leave"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "from_date": "2024-01-20",
    "to_date": "2024-01-21",
    "session_from": "First Half",
    "session_to": "Second Half",
    "leave_type": "Personal Leave",
    "reason": "Family function",
    "cc_to": "manager@example.com",
    "created_at": "2024-01-10T10:30:00.000Z"
  }
}
```

---

## 5. DELETE Leave (DELETE)
**Delete a leave**

```bash
curl -X DELETE http://localhost:3000/api/leaves/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Leave deleted successfully"
  }
}
```

**Error Response (if not found):**
```json
{
  "success": false,
  "error": "Leave not found"
}
```

---

## Request/Response Field Mapping

### Request Fields (camelCase) → Database Fields (snake_case)
- `fromDate` → `from_date`
- `toDate` → `to_date`
- `sessionFrom` → `session_from`
- `sessionTo` → `session_to`
- `leaveType` → `leave_type`
- `reason` → `reason`
- `ccTo` → `cc_to`

### Response Fields (snake_case from database)
- All fields are returned as stored in database (snake_case format)

---

## Query Parameters for GET All Leaves

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | '' | Search in leave_type and reason |
| `sortBy` | string | 'created_at' | Sort field (created_at, from_date, to_date, leave_type) |
| `sortOrder` | string | 'DESC' | Sort order (ASC or DESC) |

---

## Required Fields for CREATE
- `fromDate` (string, date format: YYYY-MM-DD)
- `toDate` (string, date format: YYYY-MM-DD)
- `sessionFrom` (string)
- `sessionTo` (string)
- `leaveType` (string)
- `reason` (string)
- `ccTo` (string, optional)

---

## Session Values (Common)
- `"First Half"` - Morning session
- `"Second Half"` - Afternoon session
- `"Full Day"` - Full day leave

---

## Leave Types (Examples)
- `"Sick Leave"`
- `"Personal Leave"`
- `"Casual Leave"`
- `"Earned Leave"`
- `"Compensatory Off"`

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "error": "Missing required fields: fromDate, toDate"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Leave not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error message here"
}
```


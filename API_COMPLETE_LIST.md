# Complete API List - Crewnet Backend

## Base URL
```
http://localhost:3000
```

---

## 📋 All 9 APIs

### 1. Health Check API
- **Method:** `GET`
- **URL:** `http://localhost:3000/health`
- **Description:** Server aur database status check
- **Headers:** None
- **Body:** None
- **Response:**
```json
{
  "status": "ok",
  "db": "connected",
  "env": "development",
  "timestamp": "2025-12-09T11:25:52.575Z"
}
```

---

### 2. Register API (Auth)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Description:** Naya user register karo
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-09T11:06:19.000Z"
  },
  "success": true
}
```

---

### 3. Login API (Auth)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Description:** User login karo, token milega
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true
}
```

---

### 4. Get Profile API (Auth)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/auth/profile/:id`
- **Description:** User profile get karo
- **Example:** `http://localhost:3000/api/auth/profile/1`
- **Headers:** None
- **Body:** None
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-09T11:06:19.000Z"
  },
  "success": true
}
```

---

### 5. Get All Employees (List)
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/employees`
- **Description:** Sab employees ki list (pagination, search, sort support)
- **Query Parameters (Optional):**
  - `page` - Page number (default: 1)
  - `limit` - Records per page (default: 10)
  - `search` - Search by name or email
  - `sortBy` - Sort field (name, email, department, status, joiningDate, createdAt)
  - `sortOrder` - ASC or DESC (default: DESC)
- **Example:** `http://localhost:3000/api/employees?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC`
- **Headers:** None
- **Body:** None
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Employees fetched successfully",
  "data": {
    "employees": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "1234567890",
        "department": "Engineering",
        "status": "Active",
        "joiningDate": "2024-01-15",
        "createdAt": "2025-12-10T12:33:30.000Z",
        "updatedAt": "2025-12-10T12:33:30.000Z"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "success": true
}
```

---

### 6. Get Employee by ID
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/employees/:id`
- **Description:** Single employee details
- **Example:** `http://localhost:3000/api/employees/1`
- **Headers:** None
- **Body:** None
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Employee fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "department": "Engineering",
    "status": "Active",
    "joiningDate": "2024-01-15",
    "createdAt": "2025-12-10T12:33:30.000Z",
    "updatedAt": "2025-12-10T12:33:30.000Z"
  },
  "success": true
}
```

---

### 7. Create Employee (Add)
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/employees`
- **Description:** Naya employee add karo
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "department": "Marketing",
  "status": "Active",
  "joiningDate": "2024-02-20"
}
```
- **Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "Employee created successfully",
  "data": {
    "id": 4,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "department": "Marketing",
    "status": "Active",
    "joiningDate": "2024-02-20",
    "createdAt": "2025-12-10T12:33:30.000Z",
    "updatedAt": "2025-12-10T12:33:30.000Z"
  },
  "success": true
}
```

---

### 8. Update Employee
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/employees/:id`
- **Description:** Existing employee update karo
- **Example:** `http://localhost:3000/api/employees/1`
- **Headers:** `Content-Type: application/json`
- **Body (All fields optional - jo update karna ho woh bhejo):**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "1111111111",
  "department": "Engineering",
  "status": "Active",
  "joiningDate": "2024-01-15"
}
```
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Employee updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "1111111111",
    "department": "Engineering",
    "status": "Active",
    "joiningDate": "2024-01-15",
    "createdAt": "2025-12-10T12:33:30.000Z",
    "updatedAt": "2025-12-10T12:33:30.000Z"
  },
  "success": true
}
```

---

### 9. Delete Employee
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/employees/:id`
- **Description:** Employee delete karo
- **Example:** `http://localhost:3000/api/employees/1`
- **Headers:** None
- **Body:** None
- **Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Employee deleted successfully",
  "success": true
}
```

---

## Error Response Format

Agar koi error aaye to yeh format hoga:
```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Error stack (only in development)"
}
```

---

## cURL Examples (Testing)

### 1. Health Check
```bash
curl.exe "http://localhost:3000/health"
```

### 2. Register
```bash
curl.exe -X POST "http://localhost:3000/api/auth/register" ^
  -H "Content-Type: application/json" ^
  --data "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 3. Login
```bash
curl.exe -X POST "http://localhost:3000/api/auth/login" ^
  -H "Content-Type: application/json" ^
  --data "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 4. Get Profile
```bash
curl.exe "http://localhost:3000/api/auth/profile/1"
```

### 5. Get All Employees
```bash
curl.exe "http://localhost:3000/api/employees?page=1&limit=10"
```

### 6. Get Employee by ID
```bash
curl.exe "http://localhost:3000/api/employees/1"
```

### 7. Create Employee
```bash
curl.exe -X POST "http://localhost:3000/api/employees" ^
  -H "Content-Type: application/json" ^
  --data "{\"name\":\"Jane Smith\",\"email\":\"jane@example.com\",\"phone\":\"9876543210\",\"department\":\"Marketing\",\"status\":\"Active\",\"joiningDate\":\"2024-02-20\"}"
```

### 8. Update Employee
```bash
curl.exe -X PUT "http://localhost:3000/api/employees/1" ^
  -H "Content-Type: application/json" ^
  --data "{\"name\":\"John Updated\",\"email\":\"john.updated@example.com\",\"phone\":\"1111111111\",\"department\":\"Engineering\",\"status\":\"Active\",\"joiningDate\":\"2024-01-15\"}"
```

### 9. Delete Employee
```bash
curl.exe -X DELETE "http://localhost:3000/api/employees/1"
```


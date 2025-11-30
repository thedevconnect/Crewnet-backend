# Employee Management System - Backend

## Project Structure

```
/src
   /config
       db.js                    # MySQL database connection
   /models
       employee.model.js        # Employee data model
   /controllers
       employee.controller.js   # Employee controllers
   /services
       employee.service.js      # Employee business logic
   /routes
       employee.routes.js       # Employee API routes
   /middlewares
       errorHandler.js          # Global error handler
       validateRequest.js       # Request validation middleware
       notFoundHandler.js       # 404 handler
   /utils
       ApiResponse.js           # Standard API response class
       ApiError.js              # Custom error class
   /database
       employees.sql            # Database schema
   app.js                      # Express app configuration
   server.js                   # Server entry point
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Run the SQL script to create the employees table:
```bash
mysql -u root -p crewnet < src/database/employees.sql
```

Or manually run the SQL in MySQL:
```sql
-- See src/database/employees.sql
```

### 3. Environment Variables
Make sure your `.env` file has:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=crewnet
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### 4. Start Server
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/employees
```

### 1. Get All Employees (with pagination, search, sorting)
```
GET /api/employees?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `sortBy` (optional): Sort field (name, email, department, status, joiningDate, createdAt)
- `sortOrder` (optional): ASC or DESC (default: DESC)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employees fetched successfully",
  "data": {
    "employees": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 2. Get Employee by ID
```
GET /api/employees/:id
```

**Response:**
```json
{
  "success": true,
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
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 3. Create Employee
```
POST /api/employees
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "department": "Engineering",
  "status": "Active",
  "joiningDate": "2024-01-15"
}
```

**Validation Rules:**
- `name`: Required, min 3 characters
- `email`: Required, valid email format, unique
- `phone`: Required, min 10 digits
- `department`: Required
- `status`: Optional, must be "Active" or "Inactive" (default: "Active")
- `joiningDate`: Required, ISO 8601 date format

### 4. Update Employee
```
PUT /api/employees/:id
```

**Request Body:** (all fields optional)
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "9876543210",
  "department": "Marketing",
  "status": "Inactive",
  "joiningDate": "2024-02-01"
}
```

### 5. Delete Employee
```
DELETE /api/employees/:id
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employee deleted successfully"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Employee not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

## Features

✅ Clean MVC Architecture  
✅ ES Modules (import/export)  
✅ MySQL Database  
✅ Request Validation (express-validator)  
✅ Global Error Handling  
✅ CORS + Helmet Security  
✅ Morgan Logging  
✅ Pagination & Search  
✅ Sorting  
✅ Production-ready structure  

## Tech Stack

- Node.js (Latest LTS)
- Express.js
- MySQL2
- express-validator
- Helmet
- Morgan
- CORS


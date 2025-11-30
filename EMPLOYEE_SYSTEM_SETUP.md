# Employee Management System - Quick Setup Guide

## ✅ Complete Structure Created

```
/src
   /config
       db.js                    ✅ MySQL connection
   /models
       employee.model.js        ✅ Employee data model
   /controllers
       employee.controller.js   ✅ Employee controllers
   /services
       employee.service.js      ✅ Employee business logic
   /routes
       employee.routes.js       ✅ Employee API routes with validation
   /middlewares
       errorHandler.js          ✅ Global error handler
       validateRequest.js       ✅ Request validation
       notFoundHandler.js       ✅ 404 handler
   /utils
       ApiResponse.js           ✅ Standard API response
       ApiError.js              ✅ Custom error class
   /database
       employees.sql            ✅ Database schema
   app.js                      ✅ Express app config
   server.js                   ✅ Server entry point
```

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```
✅ Already installed: express-validator, helmet, morgan, joi

### Step 2: Create Database Table
Run this SQL in MySQL:
```sql
-- See src/database/employees.sql
-- Or run:
mysql -u root -p crewnet < src/database/employees.sql
```

### Step 3: Check .env File
Make sure `.env` has:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=crewnet
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Step 4: Start Server
```bash
npm start
```

## 📋 API Endpoints

### 1. Get All Employees (with pagination & search)
```
GET /api/employees?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC
```

### 2. Get Employee by ID
```
GET /api/employees/:id
```

### 3. Create Employee
```
POST /api/employees
Body: { name, email, phone, department, status, joiningDate }
```

### 4. Update Employee
```
PUT /api/employees/:id
Body: { name?, email?, phone?, department?, status?, joiningDate? }
```

### 5. Delete Employee
```
DELETE /api/employees/:id
```

## ✨ Features Implemented

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
✅ Async/Await throughout  
✅ Standard API Responses  

## 🧪 Test the API

### Create Employee
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "department": "Engineering",
    "status": "Active",
    "joiningDate": "2024-01-15"
  }'
```

### Get All Employees
```bash
curl http://localhost:3000/api/employees?page=1&limit=10
```

### Get Employee by ID
```bash
curl http://localhost:3000/api/employees/1
```

## 📝 Notes

- All routes are under `/api/employees`
- Validation is automatic using express-validator
- Errors are handled globally
- Pagination defaults: page=1, limit=10
- Search works on name and email fields
- Sorting available on: name, email, department, status, joiningDate, createdAt

## 🎯 Next Steps

1. Run the database SQL script
2. Start the server: `npm start`
3. Test the endpoints using Postman or curl
4. Check health endpoint: `http://localhost:3000/health`


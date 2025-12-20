# Employee Onboarding API Documentation

## Base URL
```
http://localhost:3000/api/employees-onboarding
```

---

## 📋 All APIs

### 1. Get Dropdown Options
- **Method:** `GET`
- **URL:** `/api/employees-onboarding/dropdown-options`
- **Description:** Get all dropdown options (departments, designations, genders, etc.)
- **Response:**
```json
{
  "success": true,
  "message": "Dropdown options fetched successfully",
  "data": {
    "departments": [{"label": "HR", "value": "HR"}, ...],
    "designations": [{"label": "Manager", "value": "Manager"}, ...],
    "genders": [{"label": "Male", "value": "Male"}, ...],
    "employmentTypes": [{"label": "Full Time", "value": "Full Time"}, ...],
    "roles": [{"label": "HRADMIN", "value": "HRADMIN"}, ...],
    "statuses": [{"label": "Active", "value": "Active"}, ...]
  }
}
```

---

### 2. Create Employee
- **Method:** `POST`
- **URL:** `/api/employees-onboarding`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "1990-05-15",
  "email": "john.doe@example.com",
  "mobileNumber": "+1234567890",
  "department": "IT",
  "designation": "Senior Developer",
  "employmentType": "Full Time",
  "joiningDate": "2025-01-15",
  "role": "ESS",
  "status": "Active",
  "firstLogin": true
}
```
- **Auto-generated fields:**
  - `employeeCode`: EMP{YYYYMMDD}{001} format
  - `username`: Generated from email (part before @)
- **Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 1,
    "employeeCode": "EMP20250115001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "username": "john.doe",
    ...
  }
}
```

---

### 3. Get All Employees
- **Method:** `GET`
- **URL:** `/api/employees-onboarding`
- **Query Params:**
  - `page` (default: 1)
  - `pageSize` (default: 10)
  - `search` - Search by name, email, employee code
  - `status` - Filter by Active/Inactive
  - `department` - Filter by department
  - `sortBy` - created_at, first_name, last_name, email, department, joining_date, employee_code
  - `sortOrder` - asc/desc (default: desc)
- **Example:** `/api/employees-onboarding?page=1&pageSize=10&search=john&status=Active&department=IT&sortBy=first_name&sortOrder=asc`
- **Response:**
```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": {
    "employees": [...],
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalCount": 50,
      "totalPages": 5
    }
  }
}
```

---

### 4. Get Employee by ID
- **Method:** `GET`
- **URL:** `/api/employees-onboarding/:id`
- **Example:** `/api/employees-onboarding/1`
- **Response:**
```json
{
  "success": true,
  "message": "Employee fetched successfully",
  "data": {
    "id": 1,
    "employeeCode": "EMP20250115001",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

---

### 5. Update Employee
- **Method:** `PUT`
- **URL:** `/api/employees-onboarding/:id`
- **Body:** (All fields optional)
```json
{
  "firstName": "John Updated",
  "department": "Finance",
  "status": "Inactive"
}
```
- **Note:** `employeeCode` cannot be updated (read-only)
- **Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {...}
}
```

---

### 6. Delete Employee (Soft Delete)
- **Method:** `DELETE`
- **URL:** `/api/employees-onboarding/:id`
- **Note:** Sets status to 'Inactive' (soft delete)
- **Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## 📝 Field Mappings

### Database (snake_case) → API (camelCase)
- `employee_code` → `employeeCode`
- `first_name` → `firstName`
- `last_name` → `lastName`
- `date_of_birth` → `dateOfBirth`
- `mobile_number` → `mobileNumber`
- `employment_type` → `employmentType`
- `joining_date` → `joiningDate`
- `first_login` → `firstLogin`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- `created_by` → `createdBy`
- `updated_by` → `updatedBy`

---

## 🔒 Validation Rules

- **firstName/lastName:** Required, 1-100 chars, letters/spaces/hyphens only
- **email:** Required, unique, valid email format, max 200 chars
- **mobileNumber:** Required, unique, 10-15 digits (can include +)
- **dateOfBirth:** Required, valid date, must be in past, minimum 18 years
- **department:** Required, must be: HR, IT, Finance, Sales, Marketing, Operations
- **designation:** Required, must be: Manager, Senior Manager, Executive, Senior Executive, Associate, Intern
- **employmentType:** Required, must be: Full Time, Intern
- **role:** Required, must be: HRADMIN, ESS
- **joiningDate:** Required, valid date (can be future)

---

## 🚀 Setup Instructions

### 1. Database Setup
Run SQL file:
```bash
# In MySQL/SQLyog, run:
database_employee_onboarding.sql
```

### 2. Server Start
```bash
npm start
```

### 3. Test APIs
```bash
# Get dropdown options
curl.exe "http://localhost:3000/api/employees-onboarding/dropdown-options"

# Create employee
curl.exe -X POST "http://localhost:3000/api/employees-onboarding" ^
  -H "Content-Type: application/json" ^
  --data "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"gender\":\"Male\",\"dateOfBirth\":\"1990-05-15\",\"email\":\"john@example.com\",\"mobileNumber\":\"1234567890\",\"department\":\"IT\",\"designation\":\"Manager\",\"employmentType\":\"Full Time\",\"joiningDate\":\"2025-01-15\",\"role\":\"ESS\"}"

# Get all employees
curl.exe "http://localhost:3000/api/employees-onboarding?page=1&pageSize=10"
```

---

## ✅ Features Implemented

- ✅ Employee code auto-generation (EMP{YYYYMMDD}{001})
- ✅ Username auto-generation from email
- ✅ Complete validation rules
- ✅ Pagination, search, filter, sort
- ✅ Soft delete (status update)
- ✅ Dropdown options endpoint
- ✅ Database snake_case to API camelCase transformation
- ✅ Error handling with error codes
- ✅ All CRUD operations


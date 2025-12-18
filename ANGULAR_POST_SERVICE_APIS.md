# Angular Post Service - Login & Employee APIs

## Base URL
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## 🔐 LOGIN API

### Endpoint
```
POST /api/auth/login
```

### Request Body
```typescript
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response (Success - 200)
```typescript
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Response (Error - 401)
```typescript
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Response (Error - 400)
```typescript
{
  "success": false,
  "message": "Email and password are required"
}
```

---

## 👥 EMPLOYEE APIs

### 1. Get All Employees
```
GET /api/employees?page=1&limit=10&sortBy=name&sortOrder=ASC
```

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field: name, email, department, status, joiningDate, createdAt
- `sortOrder` - ASC or DESC (default: DESC)

**Response:**
```typescript
{
  "success": true,
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
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Employee by ID
```
GET /api/employees/:id
```

**Example:**
```
GET /api/employees/1
```

**Response:**
```typescript
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

---

### 3. Create Employee
```
POST /api/employees
```

**Request Body:**
```typescript
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "department": "Engineering",
  "status": "Active",  // Optional: "Active" or "Inactive" (default: "Active")
  "joiningDate": "2024-01-15"  // ISO 8601 format: YYYY-MM-DD
}
```

**Validation Rules:**
- `name`: Required, minimum 3 characters
- `email`: Required, valid email format, must be unique
- `phone`: Required, minimum 10 digits
- `department`: Required
- `status`: Optional, must be "Active" or "Inactive"
- `joiningDate`: Required, ISO 8601 date format (YYYY-MM-DD)

**Response (Success - 201):**
```typescript
{
  "success": true,
  "statusCode": 201,
  "message": "Employee created successfully",
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

---

### 4. Update Employee
```
PUT /api/employees/:id
```

**Example:**
```
PUT /api/employees/1
```

**Request Body (All fields optional):**
```typescript
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "9876543210",
  "department": "Marketing",
  "status": "Inactive",
  "joiningDate": "2024-02-01"
}
```

**Response:**
```typescript
{
  "success": true,
  "statusCode": 200,
  "message": "Employee updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "9876543210",
    "department": "Marketing",
    "status": "Inactive",
    "joiningDate": "2024-02-01",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T10:00:00.000Z"
  }
}
```

---

### 5. Delete Employee
```
DELETE /api/employees/:id
```

**Example:**
```
DELETE /api/employees/1
```

**Response:**
```typescript
{
  "success": true,
  "statusCode": 200,
  "message": "Employee deleted successfully"
}
```

---

## 📝 Angular Post Service Example

```typescript
// post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ============================================
  // LOGIN API
  // ============================================
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/auth/login`, body);
  }

  // ============================================
  // EMPLOYEE APIs
  // ============================================

  // Get All Employees
  getEmployees(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get(`${this.apiUrl}/employees`, { params: httpParams });
  }

  // Get Employee by ID
  getEmployee(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/employees/${id}`);
  }

  // Create Employee
  createEmployee(employee: {
    name: string;
    email: string;
    phone: string;
    department: string;
    status?: 'Active' | 'Inactive';
    joiningDate: string; // YYYY-MM-DD format
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees`, employee);
  }

  // Update Employee
  updateEmployee(id: number, employee: {
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    status?: 'Active' | 'Inactive';
    joiningDate?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/employees/${id}`, employee);
  }

  // Delete Employee
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`);
  }
}
```

---

## 🎯 Component Usage Example

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { PostService } from './post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  onLogin() {
    this.postService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success && response.token) {
          // Save token and user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        alert(error.error?.message || 'Login failed');
      }
    });
  }
}
```

```typescript
// employee.component.ts
import { Component, OnInit } from '@angular/core';
import { PostService } from './post.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];
  loading = false;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.postService.getEmployees({ page: 1, limit: 10 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.employees = response.data.employees;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  createEmployee(employeeData: any) {
    this.postService.createEmployee(employeeData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Employee created successfully!');
          this.loadEmployees(); // Refresh list
        }
      },
      error: (error) => {
        console.error('Error creating employee:', error);
        alert(error.error?.message || 'Failed to create employee');
      }
    });
  }

  updateEmployee(id: number, employeeData: any) {
    this.postService.updateEmployee(id, employeeData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Employee updated successfully!');
          this.loadEmployees(); // Refresh list
        }
      },
      error: (error) => {
        console.error('Error updating employee:', error);
        alert(error.error?.message || 'Failed to update employee');
      }
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.postService.deleteEmployee(id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Employee deleted successfully!');
            this.loadEmployees(); // Refresh list
          }
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert(error.error?.message || 'Failed to delete employee');
        }
      });
    }
  }
}
```

---

## 🔑 Important Notes

1. **CORS Setup**: Agar Angular app different port pe hai (e.g., 4200), to backend ke `.env` file me `CORS_ORIGIN=http://localhost:4200` set karo.

2. **Token Storage**: Login ke baad token ko localStorage me save karo aur protected requests me header me bhejo:
   ```typescript
   const headers = new HttpHeaders({
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   });
   ```

3. **Error Handling**: Har API call me proper error handling add karo.

4. **Date Format**: `joiningDate` hamesha `YYYY-MM-DD` format me bhejo (e.g., "2024-01-15").

5. **Email Validation**: Backend automatically email format validate karta hai.

---

## ✅ Quick Reference

| API | Method | Endpoint | Description |
|-----|--------|----------|-------------|
| Login | POST | `/api/auth/login` | User login |
| Get Employees | GET | `/api/employees` | Get all employees |
| Get Employee | GET | `/api/employees/:id` | Get employee by ID |
| Create Employee | POST | `/api/employees` | Create new employee |
| Update Employee | PUT | `/api/employees/:id` | Update employee |
| Delete Employee | DELETE | `/api/employees/:id` | Delete employee |


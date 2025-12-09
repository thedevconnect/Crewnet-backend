# Angular Me API Paths - Simple Guide

## Base URL
```typescript
const API_URL = 'http://localhost:3000/api';
```

## Auth APIs (Login/Register)

### 1. Register API
```typescript
POST http://localhost:3000/api/auth/register

// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "success": true
}
```

### 2. Login API
```typescript
POST http://localhost:3000/api/auth/login

// Request Body
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
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

### 3. Get Profile API
```typescript
GET http://localhost:3000/api/auth/profile/:id

// Example
GET http://localhost:3000/api/auth/profile/1

// Response
{
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "success": true
}
```

## Employee APIs

### 1. Get All Employees
```typescript
GET http://localhost:3000/api/employees?page=1&limit=10
```

### 2. Get Employee by ID
```typescript
GET http://localhost:3000/api/employees/:id
```

### 3. Create Employee
```typescript
POST http://localhost:3000/api/employees
```

### 4. Update Employee
```typescript
PUT http://localhost:3000/api/employees/:id
```

### 5. Delete Employee
```typescript
DELETE http://localhost:3000/api/employees/:id
```

## Angular Service Example

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  // Register
  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Get Profile
  getProfile(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${id}`);
  }
}
```

## Angular Component Example

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Token ko localStorage me save karo
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      },
      error: (error) => {
        console.error('Login error:', error);
      }
    });
  }
}
```

## Important Notes

1. **CORS**: Agar Angular app different port pe hai (4200), to `.env` me `CORS_ORIGIN` set karo
2. **Token Storage**: Login ke baad token ko localStorage me save karo
3. **Headers**: Protected routes ke liye token ko header me bhejo:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```


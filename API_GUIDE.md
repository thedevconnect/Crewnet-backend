# CrewNet Backend API Guide

## Setup Steps

### 1. Database Setup
Pehle MySQL me database create karo:
```sql
-- database.sql file ko MySQL me run karo
```

### 2. Environment Variables
`.env` file me apna MySQL password set karo:
```
DB_PASS=your_actual_mysql_password
```

### 3. Start Server
```bash
npm start
```

Server `http://localhost:3000` par chalega.

---

## API Endpoints

### 1. Register User (POST /api/register)
Naya user create karne ke liye.

**Request:**
```json
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User successfully created",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Ye email already registered hai"
}
```

---

### 2. Login (POST /api/login)
User login karne ke liye. JWT token return karta hai.

**Request:**
```json
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email ya password"
}
```

---

## Angular Implementation Example

### 1. Service File (auth.service.ts)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Register method
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      name,
      email,
      password
    });
  }

  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    });
  }
}
```

### 2. Component Example (login.component.ts)
```typescript
import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          // Token ko localStorage me save karo
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Dashboard par redirect karo
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

### 3. HTTP Interceptor (token.interceptor.ts)
JWT token ko automatically har request me add karne ke liye:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

---

## Important Notes

1. **Password Hashing**: Passwords automatically bcrypt se hash hote hain
2. **JWT Token**: Login ke baad token milta hai, ise save karo aur protected routes ke liye use karo
3. **CORS**: CORS already enabled hai, Angular se directly call kar sakte ho
4. **Error Handling**: Har endpoint me proper error handling hai

---

## Testing with Postman/Thunder Client

1. **Register:**
   - Method: POST
   - URL: `http://localhost:3000/api/register`
   - Body (JSON): `{ "name": "Test", "email": "test@test.com", "password": "test123" }`

2. **Login:**
   - Method: POST
   - URL: `http://localhost:3000/api/login`
   - Body (JSON): `{ "email": "test@test.com", "password": "test123" }`


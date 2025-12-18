# Angular Integration Guide - Complete Code

## 📦 Step 1: Create Angular Services

### A. Auth Service (`auth.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  // Register new user
  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Login user
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Get user profile
  getProfile(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${id}`);
  }

  // Save token to localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Remove token (logout)
  logout(): void {
    localStorage.removeItem('token');
  }
}
```

### B. Employee Service (`employee.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employees';

  constructor(private http: HttpClient) {}

  // Get all employees with pagination, search, sort
  getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  // Get employee by ID
  getEmployeeById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Create new employee
  createEmployee(data: {
    name: string;
    email: string;
    phone: string;
    department: string;
    status: string;
    joiningDate: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Update employee
  updateEmployee(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    status?: string;
    joiningDate?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Delete employee
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

---

## 🎨 Step 2: Create Components

### A. Login Component (`login.component.ts`)

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Email aur password required hai';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success && response.data?.token) {
          // Token save karo
          this.authService.saveToken(response.data.token);
          // User info save karo (optional)
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          // Redirect karo
          this.router.navigate(['/employees']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
```

### B. Login Template (`login.component.html`)

```html
<div class="login-container">
  <h2>Login</h2>
  
  <div *if="error" class="error">{{ error }}</div>
  
  <form (ngSubmit)="onLogin()">
    <div>
      <label>Email:</label>
      <input type="email" [(ngModel)]="email" name="email" required>
    </div>
    
    <div>
      <label>Password:</label>
      <input type="password" [(ngModel)]="password" name="password" required>
    </div>
    
    <button type="submit" [disabled]="loading">
      {{ loading ? 'Loading...' : 'Login' }}
    </button>
  </form>
</div>
```

### C. Employee List Component (`employee-list.component.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  pagination: any = {};
  loading: boolean = false;
  error: string = '';
  
  // Pagination
  currentPage: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'createdAt';
  sortOrder: string = 'DESC';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = '';

    const params = {
      page: this.currentPage,
      limit: this.limit,
      search: this.search,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.employeeService.getEmployees(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employees = response.data.employees || [];
          this.pagination = response.data.pagination || {};
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load employees';
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadEmployees();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadEmployees();
  }

  onSort(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }
    this.loadEmployees();
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadEmployees();
          }
        },
        error: (error) => {
          alert(error.error?.message || 'Failed to delete employee');
        }
      });
    }
  }
}
```

### D. Employee List Template (`employee-list.component.html`)

```html
<div class="employee-list-container">
  <h2>Employee List</h2>

  <!-- Search -->
  <div class="search-bar">
    <input type="text" [(ngModel)]="search" placeholder="Search by name or email">
    <button (click)="onSearch()">Search</button>
  </div>

  <!-- Loading -->
  <div *ngIf="loading">Loading...</div>

  <!-- Error -->
  <div *ngIf="error" class="error">{{ error }}</div>

  <!-- Employee Table -->
  <table *ngIf="!loading && employees.length > 0">
    <thead>
      <tr>
        <th (click)="onSort('name')">Name</th>
        <th (click)="onSort('email')">Email</th>
        <th>Phone</th>
        <th (click)="onSort('department')">Department</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let emp of employees">
        <td>{{ emp.name }}</td>
        <td>{{ emp.email }}</td>
        <td>{{ emp.phone }}</td>
        <td>{{ emp.department }}</td>
        <td>{{ emp.status }}</td>
        <td>
          <button (click)="editEmployee(emp.id)">Edit</button>
          <button (click)="deleteEmployee(emp.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Pagination -->
  <div *ngIf="pagination.totalPages > 1" class="pagination">
    <button 
      *ngFor="let page of [].constructor(pagination.totalPages); let i = index"
      [class.active]="currentPage === (i + 1)"
      (click)="onPageChange(i + 1)">
      {{ i + 1 }}
    </button>
  </div>
</div>
```

### E. Employee Form Component (`employee-form.component.ts`)

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  @Input() employeeId?: number;
  
  employee = {
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'Active',
    joiningDate: ''
  };
  
  loading: boolean = false;
  error: string = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.employeeId) {
      this.loadEmployee();
    }
  }

  loadEmployee() {
    if (!this.employeeId) return;
    
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employee = {
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            department: response.data.department,
            status: response.data.status,
            joiningDate: response.data.joiningDate.split('T')[0] // Date format
          };
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load employee';
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    if (this.employeeId) {
      // Update
      this.employeeService.updateEmployee(this.employeeId, this.employee).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/employees']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to update employee';
          this.loading = false;
        }
      });
    } else {
      // Create
      this.employeeService.createEmployee(this.employee).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/employees']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to create employee';
          this.loading = false;
        }
      });
    }
  }
}
```

### F. Employee Form Template (`employee-form.component.html`)

```html
<div class="employee-form-container">
  <h2>{{ employeeId ? 'Edit Employee' : 'Add Employee' }}</h2>

  <div *ngIf="error" class="error">{{ error }}</div>

  <form (ngSubmit)="onSubmit()">
    <div>
      <label>Name:</label>
      <input type="text" [(ngModel)]="employee.name" name="name" required>
    </div>

    <div>
      <label>Email:</label>
      <input type="email" [(ngModel)]="employee.email" name="email" required>
    </div>

    <div>
      <label>Phone:</label>
      <input type="text" [(ngModel)]="employee.phone" name="phone" required>
    </div>

    <div>
      <label>Department:</label>
      <input type="text" [(ngModel)]="employee.department" name="department" required>
    </div>

    <div>
      <label>Status:</label>
      <select [(ngModel)]="employee.status" name="status">
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>

    <div>
      <label>Joining Date:</label>
      <input type="date" [(ngModel)]="employee.joiningDate" name="joiningDate" required>
    </div>

    <button type="submit" [disabled]="loading">
      {{ loading ? 'Saving...' : (employeeId ? 'Update' : 'Create') }}
    </button>
  </form>
</div>
```

---

## ⚙️ Step 3: App Module Setup

### `app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { AuthService } from './services/auth.service';
import { EmployeeService } from './services/employee.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/add', component: EmployeeFormComponent },
  { path: 'employees/edit/:id', component: EmployeeFormComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EmployeeListComponent,
    EmployeeFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthService, EmployeeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 🚀 Step 4: Cursor Me Bind Karne Ka Process

### Prompt for Cursor:

```
Mujhe Angular project me backend APIs bind karni hai. 
Main project me ye services aur components create karo:

1. AuthService - login, register, getProfile APIs ke liye
2. EmployeeService - getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee APIs ke liye
3. LoginComponent - login form
4. EmployeeListComponent - employees list with pagination, search, sort
5. EmployeeFormComponent - add/edit employee form

Base URL: http://localhost:3000/api

Sabhi APIs ka response format:
{
  "success": true/false,
  "message": "...",
  "data": {...}
}

Files create karo aur proper error handling add karo.
```

---

## ✅ Quick Checklist

- [ ] `auth.service.ts` create karo
- [ ] `employee.service.ts` create karo
- [ ] `login.component.ts` + `.html` create karo
- [ ] `employee-list.component.ts` + `.html` create karo
- [ ] `employee-form.component.ts` + `.html` create karo
- [ ] `app.module.ts` me imports add karo (HttpClientModule, FormsModule, RouterModule)
- [ ] Routes configure karo
- [ ] `app.component.html` me router-outlet add karo

---

## 🧪 Testing

1. **Backend start karo:** `npm start` (port 3000)
2. **Angular start karo:** `ng serve` (port 4200)
3. **Test karo:**
   - Login page open karo
   - Employee list dekho
   - Add/Edit/Delete test karo

---

## 📝 Notes

- CORS already backend me configured hai (`cors()` middleware)
- Token localStorage me save ho raha hai (login ke baad)
- Error handling har API call me add kiya hai
- Pagination, search, sort sab working hai


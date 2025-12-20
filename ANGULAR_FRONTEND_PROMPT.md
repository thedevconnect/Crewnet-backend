# Angular Frontend Development Prompt

## Complete Backend API Integration Guide

I need to create a complete Angular application that integrates with the backend APIs listed below. The backend is already ready and all APIs are working.

---

## 📋 Backend APIs Overview

### Base URL
```
http://localhost:3000/api
```

### Authentication
JWT token is required for all protected APIs:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication APIs

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
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

### 2. Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
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

### 3. Get All Users (Dashboard)
- **Endpoint:** `GET /api/auth/users?page=1&limit=100&search=`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Users fetched successfully",
    "data": {
      "users": [...],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 100,
        "totalPages": 1
      }
    }
  }
  ```

---

## 👥 Employee Management APIs

### 1. Get All Employees
- **Endpoint:** `GET /api/employees?page=1&limit=10&sortBy=name&sortOrder=ASC`
- **Query Parameters (Optional):**
  - `page` - Page number
  - `limit` - Items per page (max 100)
  - `sortBy` - name, email, department, status, joiningDate, createdAt
  - `sortOrder` - ASC or DESC
- **Response:**
  ```json
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

### 2. Get Employee by ID
- **Endpoint:** `GET /api/employees/:id`
- **Response:**
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
- **Endpoint:** `POST /api/employees`
- **Request Body:**
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
- **Validation:**
  - `name`: Required, min 3 characters
  - `email`: Required, valid email, unique
  - `phone`: Required, min 10 digits
  - `department`: Required
  - `status`: Optional, "Active" or "Inactive"
  - `joiningDate`: Required, YYYY-MM-DD format

### 4. Update Employee
- **Endpoint:** `PUT /api/employees/:id`
- **Request Body:** (All fields optional)
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
- **Endpoint:** `DELETE /api/employees/:id`
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Employee deleted successfully"
  }
  ```

---

## ⏰ Attendance APIs (All require JWT Authentication)

### 1. Swipe In
- **Endpoint:** `POST /api/attendance/swipe-in`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success - 201):**
  ```json
  {
    "success": true,
    "message": "Swiped in successfully",
    "data": {
      "id": 1,
      "emp_id": 123,
      "attendance_date": "2024-01-15",
      "swipe_in_time": "2024-01-15T09:00:00.000Z",
      "status": "IN"
    }
  }
  ```
- **Error (400):** "Already swiped in"

### 2. Swipe Out
- **Endpoint:** `POST /api/attendance/swipe-out`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success - 200):**
  ```json
  {
    "success": true,
    "message": "Swiped out successfully",
    "data": {
      "id": 1,
      "emp_id": 123,
      "attendance_date": "2024-01-15",
      "swipe_in_time": "2024-01-15T09:00:00.000Z",
      "swipe_out_time": "2024-01-15T18:00:00.000Z",
      "status": "OUT"
    }
  }
  ```
- **Error (404):** "Swipe in not found"
- **Error (400):** "Already swiped out"

### 3. Get Today's Attendance Status
- **Endpoint:** `GET /api/attendance/today-status`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Today's attendance status fetched successfully",
    "data": {
      "canSwipeIn": true,
      "canSwipeOut": false,
      "attendance": null
    }
  }
  ```
- **Possible States:**
  - No record: `canSwipeIn: true`, `canSwipeOut: false`
  - Swiped in: `canSwipeIn: false`, `canSwipeOut: true`
  - Swiped out: `canSwipeIn: false`, `canSwipeOut: false`

---

## 🎯 Angular Application Requirements

### 1. Services to Create

#### AuthService
- `register(data)` - User registration
- `login(email, password)` - User login
- `getUsers(params?)` - Get all users (dashboard)
- `logout()` - Clear token and redirect
- `isAuthenticated()` - Check if user is logged in
- `getToken()` - Get stored token
- `getUser()` - Get current user from localStorage

#### EmployeeService
- `getEmployees(params?)` - Get all employees with pagination
- `getEmployee(id)` - Get employee by ID
- `createEmployee(data)` - Create new employee
- `updateEmployee(id, data)` - Update employee
- `deleteEmployee(id)` - Delete employee

#### AttendanceService
- `swipeIn()` - Swipe in for today
- `swipeOut()` - Swipe out for today
- `getTodayStatus()` - Get today's attendance status

### 2. Components to Create

#### Authentication Components
- **LoginComponent** - Login form with email/password
- **RegisterComponent** - Registration form
- **AuthGuard** - Route guard for protected routes

#### Employee Management Components
- **EmployeeListComponent** - List all employees with pagination, search, sorting
- **EmployeeFormComponent** - Create/Edit employee form (reusable)
- **EmployeeDetailComponent** - View employee details
- **EmployeeDeleteComponent** - Delete confirmation dialog

#### Attendance Components
- **AttendanceDashboardComponent** - Main attendance page with swipe in/out buttons
- **AttendanceStatusComponent** - Show today's status and attendance history
- **SwipeInOutComponent** - Swipe in/out buttons with status

#### Layout Components
- **HeaderComponent** - Navigation bar with user info and logout
- **SidebarComponent** - Side navigation menu
- **DashboardComponent** - Main dashboard with stats

### 3. Features Required

#### Authentication Features
- ✅ Login page with form validation
- ✅ Registration page
- ✅ JWT token storage in localStorage
- ✅ Auto-redirect to login if not authenticated
- ✅ Protected routes using AuthGuard
- ✅ Logout functionality
- ✅ Token expiration handling

#### Employee Management Features
- ✅ Employee list with pagination
- ✅ Search employees by name/email
- ✅ Sort by different fields
- ✅ Add new employee (modal/form)
- ✅ Edit employee (modal/form)
- ✅ Delete employee with confirmation
- ✅ View employee details
- ✅ Form validation (Angular reactive forms)
- ✅ Success/Error toast notifications

#### Attendance Features
- ✅ Swipe In button (disabled if already swiped in)
- ✅ Swipe Out button (disabled if not swiped in or already swiped out)
- ✅ Today's attendance status display
- ✅ Show swipe in/out times
- ✅ Real-time status updates
- ✅ Attendance history (optional - if backend provides)

#### Dashboard Features
- ✅ Total employees count
- ✅ Total users count
- ✅ Today's attendance stats
- ✅ Recent activities
- ✅ Quick actions

### 4. UI/UX Requirements

- **Modern Design:** Use Angular Material or Bootstrap
- **Responsive:** Mobile-friendly design
- **Loading States:** Show spinners during API calls
- **Error Handling:** User-friendly error messages
- **Success Messages:** Toast notifications for success actions
- **Form Validation:** Real-time validation with error messages
- **Confirmation Dialogs:** For delete actions
- **Date Formatting:** Display dates in readable format
- **Time Formatting:** Display times in 12-hour or 24-hour format

### 5. HTTP Interceptor

Create an HTTP Interceptor that:
- Automatically adds `Authorization: Bearer <token>` header to all requests
- Handles 401 errors (token expired) and redirects to login
- Shows loading spinner for all HTTP requests
- Handles common errors globally

### 6. Routing Structure

```
/                    -> Login (if not authenticated) or Dashboard
/login               -> Login page
/register            -> Register page
/dashboard           -> Main dashboard (protected)
/employees           -> Employee list (protected)
/employees/new       -> Add employee (protected)
/employees/:id       -> Employee details (protected)
/employees/:id/edit  -> Edit employee (protected)
/attendance          -> Attendance dashboard (protected)
```

### 7. State Management

- Use Angular Services for state management
- Store user info in localStorage after login
- Store token in localStorage
- Clear all on logout

### 8. Error Handling

- Global error handler service
- Toast notifications for errors
- Form validation errors
- Network error handling
- 401 unauthorized handling

---

## 📝 Implementation Checklist

### Phase 1: Setup & Authentication
- [ ] Create Angular project
- [ ] Install dependencies (Angular Material/Bootstrap, HttpClient)
- [ ] Setup routing
- [ ] Create AuthService
- [ ] Create LoginComponent
- [ ] Create RegisterComponent
- [ ] Create AuthGuard
- [ ] Create HTTP Interceptor
- [ ] Test login/register flow

### Phase 2: Employee Management
- [ ] Create EmployeeService
- [ ] Create EmployeeListComponent
- [ ] Create EmployeeFormComponent
- [ ] Create EmployeeDetailComponent
- [ ] Implement CRUD operations
- [ ] Add pagination, search, sorting
- [ ] Test all employee operations

### Phase 3: Attendance System
- [ ] Create AttendanceService
- [ ] Create AttendanceDashboardComponent
- [ ] Create SwipeInOutComponent
- [ ] Implement swipe in/out functionality
- [ ] Show today's status
- [ ] Test attendance flow

### Phase 4: Dashboard & Polish
- [ ] Create DashboardComponent
- [ ] Add statistics
- [ ] Create HeaderComponent
- [ ] Create SidebarComponent
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add toast notifications
- [ ] Responsive design
- [ ] Final testing

---

## 🎨 Design Guidelines

- **Color Scheme:** Professional blue/gray theme
- **Typography:** Clean, readable fonts
- **Icons:** Use Material Icons or Font Awesome
- **Cards:** Use card layout for content sections
- **Tables:** Responsive tables for employee list
- **Forms:** Clean form design with proper spacing
- **Buttons:** Clear primary/secondary button styles
- **Modals:** Use modals for forms and confirmations

---

## 🔧 Technical Stack

- **Angular:** Latest version (17+)
- **TypeScript:** Strict mode enabled
- **RxJS:** For observables and HTTP calls
- **Angular Material** or **Bootstrap:** For UI components
- **Angular Forms:** Reactive forms for all inputs
- **Angular Router:** For navigation
- **HTTP Client:** For API calls

---

## 📦 Package Dependencies Needed

```json
{
  "@angular/material": "^latest",
  "@angular/cdk": "^latest",
  "rxjs": "^latest",
  "date-fns": "^latest" // For date formatting
}
```

---

## ✅ Testing Requirements

- Test all API integrations
- Test form validations
- Test authentication flow
- Test protected routes
- Test error scenarios
- Test responsive design
- Test on different browsers

---

## 🚀 Deliverables

1. Complete Angular application with all components
2. All services properly implemented
3. Routing configured
4. Authentication working
5. Employee CRUD working
6. Attendance system working
7. Responsive design
8. Error handling
9. Loading states
10. Clean, production-ready code

---

## 📌 Important Notes

1. **CORS:** Backend already configured for CORS, but ensure Angular app runs on correct port
2. **Token Storage:** Store JWT token in localStorage
3. **Token Expiry:** Handle token expiration gracefully
4. **Date Format:** Backend expects dates in `YYYY-MM-DD` format
5. **Error Messages:** Display user-friendly error messages
6. **Loading States:** Show loading indicators during API calls
7. **Validation:** Client-side validation before API calls
8. **Security:** Never expose sensitive data in console logs

---

This is a complete prompt that covers everything. You can use this to build a professional Angular application that integrates perfectly with the backend.


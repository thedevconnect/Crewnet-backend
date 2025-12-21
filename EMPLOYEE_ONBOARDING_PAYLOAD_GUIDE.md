# Employee Onboarding - Payload Guide

## ✅ Your Payload is Correct!

आपका payload सही है और employee-onboarding API के साथ काम करेगा।

---

## 📋 API Endpoint:

**POST** `/api/employees-onboarding`

---

## 📤 Frontend Payload (Angular/React):

```typescript
const payload = {
  employee_code: formValue.employeeCode,        // Optional - auto-generated if not provided
  status: formValue.status.toUpperCase(),       // 'ACTIVE' or 'INACTIVE'
  first_name: formValue.firstName,
  last_name: formValue.lastName,
  gender: formValue.gender,                     // 'Male', 'Female', 'Other'
  date_of_birth: formValue.dateOfBirth 
    ? new Date(formValue.dateOfBirth).toISOString() 
    : null,
  email: formValue.email,
  mobile_number: formValue.mobileNumber,
  department: formValue.department,
  designation: formValue.designation,
  employment_type: formValue.employmentType,    // 'Full Time' or 'Intern'
  joining_date: formValue.joiningDate 
    ? new Date(formValue.joiningDate).toISOString() 
    : null,
  role: formValue.role,                         // 'HRADMIN' or 'ESS'
  username: formValue.username,                 // Optional - auto-generated from email
  first_login: formValue.firstLogin ? 1 : 0     // 1 or 0
};
```

---

## 🔄 Backend Expects (camelCase):

Backend automatically converts snake_case → camelCase, so you can also send:

```typescript
const payload = {
  firstName: formValue.firstName,
  lastName: formValue.lastName,
  gender: formValue.gender,
  dateOfBirth: formValue.dateOfBirth,
  email: formValue.email,
  mobileNumber: formValue.mobileNumber,
  department: formValue.department,
  designation: formValue.designation,
  employmentType: formValue.employmentType,
  joiningDate: formValue.joiningDate,
  role: formValue.role,
  status: formValue.status,
  // employee_code, username, first_login are auto-generated
};
```

---

## 📝 Complete Angular Service Example:

```typescript
// employee-onboarding.service.ts
createEmployee(formValue: any): Observable<any> {
  const payload = {
    status: formValue.status?.toUpperCase() || 'ACTIVE',
    firstName: formValue.firstName,
    lastName: formValue.lastName,
    gender: formValue.gender,
    dateOfBirth: formValue.dateOfBirth 
      ? new Date(formValue.dateOfBirth).toISOString().split('T')[0] 
      : null,
    email: formValue.email,
    mobileNumber: formValue.mobileNumber,
    department: formValue.department,
    designation: formValue.designation,
    employmentType: formValue.employmentType,
    joiningDate: formValue.joiningDate 
      ? new Date(formValue.joiningDate).toISOString().split('T')[0] 
      : null,
    role: formValue.role
  };

  return this.http.post(`${this.apiUrl}/employees-onboarding`, payload);
}
```

---

## ⚠️ Important Notes:

1. **Auto-Generated Fields:**
   - `employee_code`: Auto-generated (EMP{YYYYMMDD}{sequence})
   - `username`: Auto-generated from email (if duplicate, adds number)
   - You can provide them, but they're optional

2. **Date Format:**
   - Frontend: ISO string (`2024-01-15T00:00:00.000Z`)
   - Backend: Converts to `YYYY-MM-DD` format automatically
   - Better to send: `new Date(date).toISOString().split('T')[0]` for date only

3. **Status:**
   - Backend expects: `'Active'` or `'Inactive'` (case-sensitive)
   - Your `.toUpperCase()` converts to `'ACTIVE'` or `'INACTIVE'`
   - **Fix:** Use `formValue.status` directly or convert to `'Active'`/`'Inactive'`

4. **first_login:**
   - Backend expects: `true` or `false` (boolean)
   - Your `1` or `0` will work, but `true`/`false` is better

---

## 🔧 Recommended Payload (Fixed):

```typescript
const payload = {
  // Auto-generated - don't send
  // employee_code: ...,
  // username: ...,
  
  status: formValue.status || 'Active',  // 'Active' or 'Inactive' (not uppercase)
  firstName: formValue.firstName,
  lastName: formValue.lastName,
  gender: formValue.gender,
  dateOfBirth: formValue.dateOfBirth 
    ? new Date(formValue.dateOfBirth).toISOString().split('T')[0] 
    : null,
  email: formValue.email,
  mobileNumber: formValue.mobileNumber,
  department: formValue.department,
  designation: formValue.designation,
  employmentType: formValue.employmentType,
  joiningDate: formValue.joiningDate 
    ? new Date(formValue.joiningDate).toISOString().split('T')[0] 
    : null,
  role: formValue.role,
  firstLogin: formValue.firstLogin !== undefined ? formValue.firstLogin : true
};
```

---

## ✅ Your Current Payload Will Work!

आपका current payload काम करेगा, लेकिन:
- `status.toUpperCase()` → `'ACTIVE'` (backend expects `'Active'`)
- Date format → ISO string (backend converts automatically)
- `first_login: 1/0` → Works, but `true/false` is better

**Recommendation:** Use camelCase format (firstName, lastName) - it's cleaner and backend handles conversion automatically!


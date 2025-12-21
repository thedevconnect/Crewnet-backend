# Employee Fields - UI vs Backend vs Database

## ✅ सभी Fields Match हैं!

### आपका JSON (Database Format - snake_case):
```json
{
  "employee_code": "EMP-8147",
  "status": "ACTIVE",
  "first_name": "avika",
  "last_name": "tyagi",
  "gender": "Female",
  "date_of_birth": "2025-12-02T18:30:00.000Z",
  "email": "avika@gmail.com",
  "mobile_number": "9761431485",
  "department": "IT",
  "designation": "Developer",
  "employment_type": "Full Time",
  "joining_date": "2025-12-21T19:32:46.694Z",
  "role": "ESS",
  "username": "avika",
  "first_login": 1
}
```

---

## 📊 Field Mapping:

| UI/Frontend (camelCase) | Database (snake_case) | Status |
|------------------------|----------------------|--------|
| `employeeCode` | `employee_code` | ✅ Match |
| `status` | `status` | ✅ Match |
| `firstName` | `first_name` | ✅ Match |
| `lastName` | `last_name` | ✅ Match |
| `gender` | `gender` | ✅ Match |
| `dateOfBirth` | `date_of_birth` | ✅ Match |
| `email` | `email` | ✅ Match |
| `mobileNumber` | `mobile_number` | ✅ Match |
| `department` | `department` | ✅ Match |
| `designation` | `designation` | ✅ Match |
| `employmentType` | `employment_type` | ✅ Match |
| `joiningDate` | `joining_date` | ✅ Match |
| `role` | `role` | ✅ Match |
| `username` | `username` | ✅ Match |
| `firstLogin` | `first_login` | ✅ Match |

---

## 🔄 Data Flow:

### 1. **Frontend → Backend (Create/Update)**
```
Frontend sends (camelCase):
{
  "firstName": "avika",
  "lastName": "tyagi",
  ...
}

Backend converts to (snake_case) and saves:
{
  "first_name": "avika",
  "last_name": "tyagi",
  ...
}
```

### 2. **Backend → Frontend (Response)**
```
Database returns (snake_case):
{
  "first_name": "avika",
  "last_name": "tyagi",
  ...
}

Controller transforms to (camelCase):
{
  "firstName": "avika",
  "lastName": "tyagi",
  ...
}
```

---

## 📝 Database में Save होने वाली Fields:

```sql
INSERT INTO employees (
  employee_code,      -- Auto-generated: EMP{YYYYMMDD}{sequence}
  status,             -- Default: 'Active'
  first_name,         -- Required
  last_name,          -- Required
  gender,             -- Required
  date_of_birth,      -- Required (YYYY-MM-DD format)
  email,              -- Required (unique)
  mobile_number,      -- Required (unique)
  department,         -- Required
  designation,        -- Required
  employment_type,    -- Required
  joining_date,       -- Required (YYYY-MM-DD format)
  role,               -- Required
  username,           -- Auto-generated from email
  first_login         -- Default: 1 (true)
)
```

---

## ⚠️ Important Notes:

1. **Date Format:**
   - Frontend sends: ISO format with time (`2025-12-02T18:30:00.000Z`)
   - Database stores: Date only (`2025-12-02`)
   - Backend automatically converts using `formatDateForDB()`

2. **Auto-Generated Fields:**
   - `employee_code`: Auto-generated (EMP{YYYYMMDD}{sequence})
   - `username`: Auto-generated from email (if duplicate, adds number)

3. **Default Values:**
   - `status`: Defaults to 'Active' if not provided
   - `first_login`: Defaults to `1` (true) if not provided

4. **Field Transformation:**
   - Controller automatically converts between camelCase ↔ snake_case
   - You don't need to worry about this - it's handled automatically!

---

## ✅ Conclusion:

**हाँ, ये exact same fields हैं जो database में save होती हैं!**

- UI में: camelCase format
- Database में: snake_case format
- Backend automatically convert करता है

आपको कुछ change करने की जरूरत नहीं है - सब कुछ properly configured है! 🎉


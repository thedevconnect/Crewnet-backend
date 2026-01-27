# RBAC API - cURL Commands

## 🔐 RBAC API Endpoints

---

## 1. GET All Roles

```bash
curl http://localhost:3000/api/rbac/roles
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Roles fetched successfully",
  "success": true,
  "data": [
    {
      "id": 1,
      "role_name": "Super Admin",
      "role_code": "SUPER_ADMIN",
      "description": "Full system access with all permissions",
      "status": "Active",
      "created_at": "2026-01-24T10:00:00.000Z",
      "updated_at": "2026-01-24T10:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    },
    {
      "id": 2,
      "role_name": "HR Admin",
      "role_code": "HR_ADMIN",
      "description": "Human Resources administration access",
      "status": "Active",
      "created_at": "2026-01-24T10:00:00.000Z",
      "updated_at": "2026-01-24T10:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    },
    {
      "id": 3,
      "role_name": "Employee Self Service",
      "role_code": "ESS",
      "description": "Employee self-service portal access",
      "status": "Active",
      "created_at": "2026-01-24T10:00:00.000Z",
      "updated_at": "2026-01-24T10:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    }
  ]
}
```

---

## 2. GET Menus by Role ID

```bash
# HR Admin menus (role_id = 2)
curl http://localhost:3000/api/rbac/roles/2/menus

# ESS menus (role_id = 3)
curl http://localhost:3000/api/rbac/roles/3/menus

# Super Admin menus (role_id = 1)
curl http://localhost:3000/api/rbac/roles/1/menus
```

**Response (HR Admin example):**
```json
{
  "statusCode": 200,
  "message": "Menus fetched successfully",
  "success": true,
  "data": {
    "role": {
      "id": 2,
      "roleName": "HR Admin",
      "roleCode": "HR_ADMIN",
      "description": "Human Resources administration access"
    },
    "menus": [
      {
        "id": 1,
        "menuName": "Dashboard",
        "menuCode": "DASHBOARD",
        "menuIcon": "pi-home",
        "menuPath": "/dashboard",
        "displayOrder": 1,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 1,
            "subMenuName": "View Dashboard",
            "subMenuCode": "DASHBOARD_VIEW",
            "subMenuPath": "/dashboard",
            "displayOrder": 1
          }
        ]
      },
      {
        "id": 3,
        "menuName": "Employee Onboarding",
        "menuCode": "EMPLOYEE_ONBOARDING",
        "menuIcon": "pi-users",
        "menuPath": "/HrEmployees",
        "displayOrder": 3,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 2,
            "subMenuName": "View Employees",
            "subMenuCode": "EMPLOYEE_VIEW",
            "subMenuPath": "/HrEmployees",
            "displayOrder": 1
          },
          {
            "id": 3,
            "subMenuName": "Add Employee",
            "subMenuCode": "EMPLOYEE_ADD",
            "subMenuPath": "/HrEmployees/add",
            "displayOrder": 2
          }
        ]
      }
    ]
  }
}
```

---

## 3. GET Menus by Role Code

```bash
# ESS menus
curl http://localhost:3000/api/rbac/roles/code/ESS/menus

# HR Admin menus
curl http://localhost:3000/api/rbac/roles/code/HR_ADMIN/menus

# Super Admin menus
curl http://localhost:3000/api/rbac/roles/code/SUPER_ADMIN/menus
```

**Response:** Same as Role ID endpoint

---

## 4. 🎯 Frontend Menu API (New - Angular Compatible)

### Get ESS Menus (Frontend Format)

```bash
curl http://localhost:3000/api/rbac/frontend/menus/ESS
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Menus fetched successfully",
  "success": true,
  "data": [
    {
      "menu": "Dashboard",
      "icon": "pi-home",
      "route": "/ess/dashboard",
      "menuCode": "DASHBOARD",
      "displayOrder": 1
    },
    {
      "menu": "Employee Profile Setup",
      "icon": "pi-user",
      "route": "/ess/emp-profile-setup",
      "menuCode": "EMPLOYEE_PROFILE",
      "displayOrder": 2
    },
    {
      "menu": "Leaves",
      "icon": "pi-calendar-minus",
      "route": "/ess/leaves",
      "menuCode": "LEAVES",
      "displayOrder": 4
    },
    {
      "menu": "Attendance",
      "icon": "pi-calendar",
      "route": "/ess/attendance",
      "menuCode": "ATTENDANCE",
      "displayOrder": 5
    },
    {
      "menu": "Employee Calendar",
      "icon": "pi-calendar-plus",
      "route": "/ess/employee-calendar",
      "menuCode": "EMPLOYEE_CALENDAR",
      "displayOrder": 6
    },
    {
      "menu": "Shifts",
      "icon": "pi-clock",
      "route": "/ess/shifts",
      "menuCode": "SHIFTS",
      "displayOrder": 7
    },
    {
      "menu": "Departments",
      "icon": "pi-building",
      "route": "/ess/departments",
      "menuCode": "DEPARTMENTS",
      "displayOrder": 8
    },
    {
      "menu": "Reports",
      "icon": "pi-file",
      "route": "/ess/reports",
      "menuCode": "REPORTS",
      "displayOrder": 9
    },
    {
      "menu": "Settings",
      "icon": "pi-cog",
      "route": "/ess/settings",
      "menuCode": "SETTINGS",
      "displayOrder": 10
    },
    {
      "menu": "Tickets",
      "icon": "pi-ticket",
      "route": "/ess/tickets",
      "menuCode": "TICKETS",
      "displayOrder": 11
    },
    {
      "menu": "Holidays",
      "icon": "pi-calendar-times",
      "route": "/ess/holidays",
      "menuCode": "HOLIDAYS",
      "displayOrder": 12
    },
    {
      "menu": "Logout",
      "icon": "pi-sign-out",
      "route": "/ess/logout",
      "menuCode": "LOGOUT",
      "displayOrder": 13
    }
  ]
}
```

### Get HR Admin Menus (Frontend Format)

```bash
curl http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Menus fetched successfully",
  "success": true,
  "data": [
    {
      "menu": "Dashboard",
      "icon": "pi-home",
      "route": "/hr-admin/dashboard",
      "menuCode": "DASHBOARD",
      "displayOrder": 1
    },
    {
      "menu": "Employee Onboarding",
      "icon": "pi-users",
      "route": "/hr-admin/HrEmployees",
      "menuCode": "EMPLOYEE_ONBOARDING",
      "displayOrder": 3
    },
    {
      "menu": "Leaves",
      "icon": "pi-calendar-minus",
      "route": "/hr-admin/leaves",
      "menuCode": "LEAVES",
      "displayOrder": 4
    },
    {
      "menu": "Attendance",
      "icon": "pi-calendar",
      "route": "/hr-admin/attendance",
      "menuCode": "ATTENDANCE",
      "displayOrder": 5
    },
    {
      "menu": "Shifts",
      "icon": "pi-clock",
      "route": "/hr-admin/shifts",
      "menuCode": "SHIFTS",
      "displayOrder": 7
    },
    {
      "menu": "Departments",
      "icon": "pi-building",
      "route": "/hr-admin/departments",
      "menuCode": "DEPARTMENTS",
      "displayOrder": 8
    },
    {
      "menu": "Reports",
      "icon": "pi-file",
      "route": "/hr-admin/reports",
      "menuCode": "REPORTS",
      "displayOrder": 9
    },
    {
      "menu": "Settings",
      "icon": "pi-cog",
      "route": "/hr-admin/settings",
      "menuCode": "SETTINGS",
      "displayOrder": 10
    },
    {
      "menu": "Tickets",
      "icon": "pi-ticket",
      "route": "/hr-admin/tickets",
      "menuCode": "TICKETS",
      "displayOrder": 11
    },
    {
      "menu": "Logout",
      "icon": "pi-sign-out",
      "route": "/hr-admin/logout",
      "menuCode": "LOGOUT",
      "displayOrder": 13
    }
  ]
}
```

---

## 5. GET Fallback Menus

```bash
# ESS fallback menus
curl http://localhost:3000/api/rbac/frontend/menus/ESS/fallback

# HR Admin fallback menus
curl http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN/fallback
```

**Response:** Same format as frontend menus (hardcoded fallback)

---

## 📋 Summary of All Endpoints

| Endpoint | Method | Description | Use Case |
|----------|--------|-------------|----------|
| `/api/rbac/roles` | GET | Get all roles | Admin dashboard |
| `/api/rbac/roles/:roleId/menus` | GET | Get menus by role ID | Full menu structure |
| `/api/rbac/roles/code/:roleCode/menus` | GET | Get menus by role code | Full menu structure |
| `/api/rbac/frontend/menus/:roleCode` | GET | Get menus (Angular format) | **Angular sidebar** ⭐ |
| `/api/rbac/frontend/menus/:roleCode/fallback` | GET | Get fallback menus | Testing/Fallback |

---

## 🎯 Recommended for Frontend

**Use this endpoint for Angular:**

```bash
# ESS role
curl http://localhost:3000/api/rbac/frontend/menus/ESS

# HR Admin role
curl http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN
```

यह endpoint आपके Angular MenuItem interface के लिए perfect है! 🚀

---

## 🧪 Testing Script

```bash
#!/bin/bash

echo "=== Testing RBAC APIs ==="

echo -e "\n1. Get All Roles:"
curl -s http://localhost:3000/api/rbac/roles | json_pp

echo -e "\n2. Get ESS Menus (Frontend Format):"
curl -s http://localhost:3000/api/rbac/frontend/menus/ESS | json_pp

echo -e "\n3. Get HR Admin Menus (Frontend Format):"
curl -s http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN | json_pp

echo -e "\n4. Get Menus by Role Code (Full Structure):"
curl -s http://localhost:3000/api/rbac/roles/code/ESS/menus | json_pp

echo -e "\nDone!"
```

---

## 💡 PowerShell Commands (Windows)

```powershell
# Get all roles
Invoke-RestMethod -Uri "http://localhost:3000/api/rbac/roles" -Method Get

# Get ESS menus
Invoke-RestMethod -Uri "http://localhost:3000/api/rbac/frontend/menus/ESS" -Method Get

# Get HR Admin menus
Invoke-RestMethod -Uri "http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN" -Method Get
```

---

## 🔍 Error Response

```json
{
  "statusCode": 404,
  "message": "Role not found",
  "success": false,
  "data": null
}
```
# RBAC (Role-Based Access Control) System Documentation

## Overview

This RBAC system provides a dynamic, scalable solution for managing roles, menus, and permissions in the HRMS application. The system is fully dynamic - admins can assign any menu/submenu combination to any role without code changes.

## Database Schema

### Tables

1. **roles** - Stores all system roles
2. **menus** - Stores top-level menu items
3. **sub_menus** - Stores submenu items (activities) under each menu
4. **role_menu_mapping** - Maps roles to menus (many-to-many)
5. **role_submenu_mapping** - Maps roles to submenus (many-to-many)
6. **user_activity_log** - Future-ready table for activity tracking

### Key Features

- ✅ Fully dynamic menu and permission assignment
- ✅ Audit trails (created_by, updated_by, timestamps)
- ✅ Future-ready fields (IP address, login tracking)
- ✅ Normalized database structure
- ✅ Support for nested menus (parent_menu_id)
- ✅ Status management (Active/Inactive)

## Setup Instructions

### 1. Run Database Schema

```bash
mysql -u root -p crewnet < src/database/rbac_schema.sql
```

### 2. Insert Sample Data

```bash
mysql -u root -p crewnet < src/database/rbac_sample_data.sql
```

Or run both in MySQL Workbench/SQLyog.

## API Endpoints

### Base URL
```
http://localhost:3000/api/rbac
```

### 1. GET /api/rbac/roles

Get all active roles in the system.

**Request:**
```http
GET /api/rbac/roles
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
    },
    {
      "id": 4,
      "role_name": "Developer",
      "role_code": "DEVELOPER",
      "description": "Developer access for testing and development",
      "status": "Active",
      "created_at": "2026-01-24T10:00:00.000Z",
      "updated_at": "2026-01-24T10:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    }
  ]
}
```

### 2. GET /api/rbac/roles/:roleId/menus

Get menus and submenus for a specific role by role ID. Response is optimized for Angular sidebar routing.

**Request:**
```http
GET /api/rbac/roles/2/menus
```

**Response:**
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
        "menuIcon": "fa-dashboard",
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
        "id": 2,
        "menuName": "Employees",
        "menuCode": "EMPLOYEES",
        "menuIcon": "fa-users",
        "menuPath": "/employees",
        "displayOrder": 2,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 2,
            "subMenuName": "View Employees",
            "subMenuCode": "EMPLOYEES_VIEW",
            "subMenuPath": "/employees/list",
            "displayOrder": 1
          },
          {
            "id": 3,
            "subMenuName": "Add Employee",
            "subMenuCode": "EMPLOYEES_ADD",
            "subMenuPath": "/employees/add",
            "displayOrder": 2
          },
          {
            "id": 4,
            "subMenuName": "Edit Employee",
            "subMenuCode": "EMPLOYEES_EDIT",
            "subMenuPath": "/employees/edit",
            "displayOrder": 3
          },
          {
            "id": 5,
            "subMenuName": "Delete Employee",
            "subMenuCode": "EMPLOYEES_DELETE",
            "subMenuPath": "/employees/delete",
            "displayOrder": 4
          },
          {
            "id": 6,
            "subMenuName": "Employee Onboarding",
            "subMenuCode": "EMPLOYEES_ONBOARDING",
            "subMenuPath": "/employees/onboarding",
            "displayOrder": 5
          }
        ]
      },
      {
        "id": 3,
        "menuName": "Attendance",
        "menuCode": "ATTENDANCE",
        "menuIcon": "fa-clock",
        "menuPath": "/attendance",
        "displayOrder": 3,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 7,
            "subMenuName": "View Attendance",
            "subMenuCode": "ATTENDANCE_VIEW",
            "subMenuPath": "/attendance/list",
            "displayOrder": 1
          },
          {
            "id": 8,
            "subMenuName": "Swipe In/Out",
            "subMenuCode": "ATTENDANCE_SWIPE",
            "subMenuPath": "/attendance/swipe",
            "displayOrder": 2
          },
          {
            "id": 9,
            "subMenuName": "Attendance Reports",
            "subMenuCode": "ATTENDANCE_REPORTS",
            "subMenuPath": "/attendance/reports",
            "displayOrder": 3
          }
        ]
      },
      {
        "id": 4,
        "menuName": "Leaves",
        "menuCode": "LEAVES",
        "menuIcon": "fa-calendar-alt",
        "menuPath": "/leaves",
        "displayOrder": 4,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 10,
            "subMenuName": "View Leaves",
            "subMenuCode": "LEAVES_VIEW",
            "subMenuPath": "/leaves/list",
            "displayOrder": 1
          },
          {
            "id": 11,
            "subMenuName": "Apply Leave",
            "subMenuCode": "LEAVES_APPLY",
            "subMenuPath": "/leaves/apply",
            "displayOrder": 2
          },
          {
            "id": 12,
            "subMenuName": "Approve Leave",
            "subMenuCode": "LEAVES_APPROVE",
            "subMenuPath": "/leaves/approve",
            "displayOrder": 3
          },
          {
            "id": 13,
            "subMenuName": "Reject Leave",
            "subMenuCode": "LEAVES_REJECT",
            "subMenuPath": "/leaves/reject",
            "displayOrder": 4
          }
        ]
      },
      {
        "id": 5,
        "menuName": "Calendar",
        "menuCode": "CALENDAR",
        "menuIcon": "fa-calendar",
        "menuPath": "/calendar",
        "displayOrder": 5,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 14,
            "subMenuName": "View Calendar",
            "subMenuCode": "CALENDAR_VIEW",
            "subMenuPath": "/calendar",
            "displayOrder": 1
          },
          {
            "id": 15,
            "subMenuName": "Manage Holidays",
            "subMenuCode": "CALENDAR_HOLIDAYS",
            "subMenuPath": "/calendar/holidays",
            "displayOrder": 2
          }
        ]
      },
      {
        "id": 6,
        "menuName": "Reports",
        "menuCode": "REPORTS",
        "menuIcon": "fa-chart-bar",
        "menuPath": "/reports",
        "displayOrder": 6,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 16,
            "subMenuName": "View Reports",
            "subMenuCode": "REPORTS_VIEW",
            "subMenuPath": "/reports",
            "displayOrder": 1
          },
          {
            "id": 17,
            "subMenuName": "Export Reports",
            "subMenuCode": "REPORTS_EXPORT",
            "subMenuPath": "/reports/export",
            "displayOrder": 2
          }
        ]
      }
    ]
  }
}
```

### 3. GET /api/rbac/roles/code/:roleCode/menus

Get menus and submenus for a specific role by role code. Useful when you know the role code from the user's session.

**Request:**
```http
GET /api/rbac/roles/code/ESS/menus
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Menus fetched successfully",
  "success": true,
  "data": {
    "role": {
      "id": 3,
      "roleName": "Employee Self Service",
      "roleCode": "ESS",
      "description": "Employee self-service portal access"
    },
    "menus": [
      {
        "id": 1,
        "menuName": "Dashboard",
        "menuCode": "DASHBOARD",
        "menuIcon": "fa-dashboard",
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
        "menuName": "Attendance",
        "menuCode": "ATTENDANCE",
        "menuIcon": "fa-clock",
        "menuPath": "/attendance",
        "displayOrder": 3,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 7,
            "subMenuName": "View Attendance",
            "subMenuCode": "ATTENDANCE_VIEW",
            "subMenuPath": "/attendance/list",
            "displayOrder": 1
          },
          {
            "id": 8,
            "subMenuName": "Swipe In/Out",
            "subMenuCode": "ATTENDANCE_SWIPE",
            "subMenuPath": "/attendance/swipe",
            "displayOrder": 2
          }
        ]
      },
      {
        "id": 4,
        "menuName": "Leaves",
        "menuCode": "LEAVES",
        "menuIcon": "fa-calendar-alt",
        "menuPath": "/leaves",
        "displayOrder": 4,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 10,
            "subMenuName": "View Leaves",
            "subMenuCode": "LEAVES_VIEW",
            "subMenuPath": "/leaves/list",
            "displayOrder": 1
          },
          {
            "id": 11,
            "subMenuName": "Apply Leave",
            "subMenuCode": "LEAVES_APPLY",
            "subMenuPath": "/leaves/apply",
            "displayOrder": 2
          }
        ]
      },
      {
        "id": 5,
        "menuName": "Calendar",
        "menuCode": "CALENDAR",
        "menuIcon": "fa-calendar",
        "menuPath": "/calendar",
        "displayOrder": 5,
        "parentMenuId": null,
        "subMenus": [
          {
            "id": 14,
            "subMenuName": "View Calendar",
            "subMenuCode": "CALENDAR_VIEW",
            "subMenuPath": "/calendar",
            "displayOrder": 1
          }
        ]
      }
    ]
  }
}
```

## Angular Integration Example

### Service (TypeScript)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Menu {
  id: number;
  menuName: string;
  menuCode: string;
  menuIcon: string;
  menuPath: string;
  displayOrder: number;
  parentMenuId: number | null;
  subMenus: SubMenu[];
}

export interface SubMenu {
  id: number;
  subMenuName: string;
  subMenuCode: string;
  subMenuPath: string;
  displayOrder: number;
}

export interface RoleMenus {
  role: {
    id: number;
    roleName: string;
    roleCode: string;
    description: string;
  };
  menus: Menu[];
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private apiUrl = 'http://localhost:3000/api/rbac';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  getMenusByRoleId(roleId: number): Observable<RoleMenus> {
    return this.http.get<RoleMenus>(`${this.apiUrl}/roles/${roleId}/menus`);
  }

  getMenusByRoleCode(roleCode: string): Observable<RoleMenus> {
    return this.http.get<RoleMenus>(`${this.apiUrl}/roles/code/${roleCode}/menus`);
  }
}
```

### Component Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { RbacService, Menu } from './rbac.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  menus: Menu[] = [];
  roleCode: string = 'ESS'; // Get from auth service

  constructor(private rbacService: RbacService) {}

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.rbacService.getMenusByRoleCode(this.roleCode).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.menus = response.data.menus;
        }
      },
      error: (error) => {
        console.error('Failed to load menus:', error);
      }
    });
  }
}
```

### Template Example

```html
<nav class="sidebar">
  <ul>
    <li *ngFor="let menu of menus">
      <a [routerLink]="menu.menuPath">
        <i [class]="menu.menuIcon"></i>
        {{ menu.menuName }}
      </a>
      <ul *ngIf="menu.subMenus && menu.subMenus.length > 0">
        <li *ngFor="let subMenu of menu.subMenus">
          <a [routerLink]="subMenu.subMenuPath">
            {{ subMenu.subMenuName }}
          </a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

## Database Management

### Adding a New Role

```sql
INSERT INTO roles (role_name, role_code, description, status, created_by)
VALUES ('Manager', 'MANAGER', 'Department manager access', 'Active', 1);
```

### Adding a New Menu

```sql
INSERT INTO menus (menu_name, menu_code, menu_icon, menu_path, display_order, status, created_by)
VALUES ('Payroll', 'PAYROLL', 'fa-money', '/payroll', 9, 'Active', 1);
```

### Adding a New Submenu

```sql
INSERT INTO sub_menus (menu_id, sub_menu_name, sub_menu_code, sub_menu_path, display_order, status, created_by)
SELECT id, 'View Payroll', 'PAYROLL_VIEW', '/payroll/list', 1, 'Active', 1
FROM menus WHERE menu_code = 'PAYROLL';
```

### Assigning Menu to Role

```sql
INSERT INTO role_menu_mapping (role_id, menu_id, created_by)
SELECT r.id, m.id, 1
FROM roles r, menus m
WHERE r.role_code = 'HR_ADMIN' AND m.menu_code = 'PAYROLL';
```

### Assigning Submenu to Role

```sql
INSERT INTO role_submenu_mapping (role_id, submenu_id, created_by)
SELECT r.id, sm.id, 1
FROM roles r, sub_menus sm
WHERE r.role_code = 'HR_ADMIN' AND sm.sub_menu_code = 'PAYROLL_VIEW';
```

## Error Responses

### Role Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Role not found",
  "success": false,
  "data": null
}
```

### Invalid Role ID (400)

```json
{
  "statusCode": 400,
  "message": "Invalid role ID",
  "success": false,
  "data": null
}
```

## Best Practices

1. **Cache Menu Data**: In Angular, cache the menu response in a service to avoid repeated API calls
2. **Route Guards**: Use Angular route guards to check submenu permissions before allowing navigation
3. **Dynamic Routing**: Build routes dynamically from the menu data
4. **Permission Checks**: Store submenu codes in a Set for O(1) permission checks
5. **Audit Trail**: Always set `created_by` and `updated_by` when modifying RBAC data

## Future Enhancements

The schema includes `user_activity_log` table for future implementation of:
- Login tracking
- Swipe-in/out logging
- IP address tracking
- Menu access logging
- Activity audit trails

## Notes

- All timestamps are in UTC
- Status field allows soft deletes (set to 'Inactive')
- Display order controls menu/submenu ordering
- Parent menu support allows nested menu structures
- All foreign keys use CASCADE DELETE for data integrity

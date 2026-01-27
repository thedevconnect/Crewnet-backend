# Frontend Menu Integration Guide

## Overview

आपके Angular frontend के hardcoded menus को API-based dynamic system में convert कर दिया गया है।

---

## 🔧 Backend Setup

### 1. Database Setup

```bash
# पहले existing RBAC tables clear करें और नया data insert करें
mysql -u root -p crewnet < src/database/frontend_menus_data.sql
```

### 2. API Endpoints

**New Frontend-specific API:**

- `GET /api/rbac/frontend/menus/ESS` - ESS role के लिए menus
- `GET /api/rbac/frontend/menus/HR_ADMIN` - HR Admin role के लिए menus
- `GET /api/rbac/frontend/menus/ESS/fallback` - Fallback menus (if API fails)

---

## 📱 Angular Frontend Changes

### 1. Service Update

**`menu.service.ts`** या जो भी service आप use कर रहे हैं:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MenuItem {
  menu: string;
  icon: string;
  route: string;
  menuCode?: string;
  displayOrder?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:3000/api/rbac/frontend';

  constructor(private http: HttpClient) {}

  /**
   * Get menus from API with fallback to hardcoded menus
   */
  getMenusByRole(roleCode: string): Observable<MenuItem[]> {
    return this.http.get<any>(`${this.apiUrl}/menus/${roleCode}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.warn('API failed, using fallback menus', error);
          return this.getFallbackMenus(roleCode);
        })
      );
  }

  /**
   * Get fallback menus (API endpoint for your hardcoded menus)
   */
  getFallbackMenus(roleCode: string): Observable<MenuItem[]> {
    return this.http.get<any>(`${this.apiUrl}/menus/${roleCode}/fallback`)
      .pipe(
        map(response => response.success ? response.data : this.getHardcodedMenus(roleCode)),
        catchError(() => of(this.getHardcodedMenus(roleCode)))
      );
  }

  /**
   * Local hardcoded fallback (same as your original code)
   */
  private getHardcodedMenus(roleCode: string): MenuItem[] {
    if (roleCode === 'ESS') {
      return [
        { menu: 'Dashboard', icon: 'pi-home', route: '/ess/dashboard' },
        { menu: 'Employee Profile Setup', icon: 'pi-user', route: '/ess/emp-profile-setup' },
        { menu: 'Leaves', icon: 'pi-calendar-minus', route: '/ess/leaves' },
        { menu: 'Attendance', icon: 'pi-calendar', route: '/ess/attendance' },
        { menu: 'Employee Calendar', icon: 'pi-calendar-plus', route: '/ess/employee-calendar' },
        { menu: 'Shifts', icon: 'pi-clock', route: '/ess/shifts' },
        { menu: 'Departments', icon: 'pi-building', route: '/ess/departments' },
        { menu: 'Reports', icon: 'pi-file', route: '/ess/reports' },
        { menu: 'Settings', icon: 'pi-cog', route: '/ess/settings' },
        { menu: 'Tickets', icon: 'pi-ticket', route: '/ess/tickets' },
        { menu: 'Holidays', icon: 'pi-calendar-times', route: '/ess/holidays' },
        { menu: 'Logout', icon: 'pi-sign-out', route: '/ess/logout' }
      ];
    } else if (roleCode === 'HR_ADMIN') {
      return [
        { menu: 'Dashboard', icon: 'pi-home', route: '/hr-admin/dashboard' },
        { menu: 'Employee Onboarding', icon: 'pi-users', route: '/hr-admin/HrEmployees' },
        { menu: 'Leaves', icon: 'pi-calendar-minus', route: '/hr-admin/leaves' },
        { menu: 'Attendance', icon: 'pi-calendar', route: '/hr-admin/attendance' },
        { menu: 'Shifts', icon: 'pi-clock', route: '/hr-admin/shifts' },
        { menu: 'Departments', icon: 'pi-building', route: '/hr-admin/departments' },
        { menu: 'Reports', icon: 'pi-file', route: '/hr-admin/reports' },
        { menu: 'Settings', icon: 'pi-cog', route: '/hr-admin/settings' },
        { menu: 'Tickets', icon: 'pi-ticket', route: '/hr-admin/tickets' },
        { menu: 'Logout', icon: 'pi-sign-out', route: '/hr-admin/logout' }
      ];
    }
    return [];
  }
}
```

### 2. Component Update

**आपके component में:**

```typescript
export class YourComponent {
  private selectedRoleId = signal<string>('ess');
  menuItems: MenuItem[] = [];

  constructor(private menuService: MenuService) {}

  ngOnInit() {
    this.loadMenus();
  }

  private loadMenus() {
    const roleCode = this.selectedRoleId().toUpperCase();
    
    this.menuService.getMenusByRole(roleCode).subscribe({
      next: (menus) => {
        this.menuItems = menus;
        console.log('Loaded menus from API:', menus);
      },
      error: (error) => {
        console.error('Failed to load menus:', error);
        // Fallback को automatically handle हो जाएगा service में
      }
    });
  }

  // Remove this method - अब API से आएगा
  // private getFallbackMenus(): MenuItem[] { ... }
}
```

---

## 🧪 Testing

### 1. Test API Endpoints

```bash
# ESS menus
curl "http://localhost:3000/api/rbac/frontend/menus/ESS"

# HR Admin menus
curl "http://localhost:3000/api/rbac/frontend/menus/HR_ADMIN"

# Fallback menus
curl "http://localhost:3000/api/rbac/frontend/menus/ESS/fallback"
```

### 2. Expected Response Format

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
    }
  ]
}
```

---

## ✅ Benefits

### 1. Dynamic Menu Management
- Admin can add/remove menus from database
- No frontend code changes needed
- Role-based menu visibility

### 2. Scalability
- Easy to add new roles
- Menu permissions can be fine-tuned
- Supports nested menu structures

### 3. Fallback System
- Local hardcoded fallback if API fails
- Multiple fallback levels
- Production-ready error handling

---

## 🔄 Migration Strategy

### Phase 1: Parallel Running
1. Keep existing `getFallbackMenus()` method
2. Add API call alongside
3. Test both systems

### Phase 2: Switch to API
1. Replace hardcoded logic with API calls
2. Use fallback endpoints for safety
3. Monitor API performance

### Phase 3: Full Dynamic
1. Remove hardcoded fallbacks
2. Admin interface for menu management
3. Real-time menu updates

---

## 🛠️ Admin Interface (Future Enhancement)

Database में menus manage करने के लिए admin interface बना सकते हैं:

### Menu Management APIs
- `POST /api/rbac/menus` - Add new menu
- `PUT /api/rbac/menus/:id` - Update menu
- `DELETE /api/rbac/menus/:id` - Delete menu
- `POST /api/rbac/roles/:roleId/menus` - Assign menu to role

### Role Assignment APIs
- `GET /api/rbac/roles/:roleId/permissions` - Get role permissions
- `PUT /api/rbac/roles/:roleId/permissions` - Update role permissions

---

## 🔒 Security Considerations

1. **Role Validation**: API validates role before returning menus
2. **Menu Filtering**: Only active menus returned
3. **Route Protection**: Angular guards should still check permissions
4. **Audit Trail**: All menu changes logged in database

---

## 📋 Next Steps

1. **Database Setup**: Run `frontend_menus_data.sql`
2. **Test APIs**: Verify endpoints return correct menus
3. **Update Frontend**: Implement service and component changes
4. **Test Integration**: Ensure smooth fallback behavior
5. **Monitor Performance**: Check API response times
6. **Plan Admin Interface**: For future menu management

---

## 🚀 Quick Start

```bash
# 1. Setup database
mysql -u root -p crewnet < src/database/frontend_menus_data.sql

# 2. Test API
curl "http://localhost:3000/api/rbac/frontend/menus/ESS"

# 3. Update Angular service to use API
# 4. Remove hardcoded getFallbackMenus() method
# 5. Test both ESS and HR_ADMIN roles
```

अब आपका menu system fully dynamic हो गया है! 🎉
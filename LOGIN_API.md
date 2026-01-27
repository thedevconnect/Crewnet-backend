# Login API

## Setup

```bash
mysql -u root -p crewnet < src/database/user_roles_schema.sql
```

## API

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"user@email.com","password":"password"}'
```

## Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 10,
    "email": "user@email.com",
    "userRole": [
      {
        "roleId": "1",
        "roleCode": "DEVELOPER",
        "rolDes": "Developer",
        "isSuperAdmin": 0
      },
      {
        "roleId": "2",
        "roleCode": "SUPER_ADMIN",
        "rolDes": "Super Admin",
        "isSuperAdmin": 1
      }
    ]
  }
}
```

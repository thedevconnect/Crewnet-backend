# Postman Test Commands

## 1. Register API (Naya User Create Karne Ke Liye)

### cURL Command:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Postman Me Kaise Use Karein:
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/register`
3. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body:** (raw JSON select karo)
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```

---

## 2. Login API

### cURL Command:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Postman Me Kaise Use Karein:
1. **Method:** POST
2. **URL:** `http://localhost:3000/api/login`
3. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body:** (raw JSON select karo)
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```

---

## 3. Health Check (Server Check Karne Ke Liye)

### cURL Command:
```bash
curl -X GET http://localhost:3000/health
```

### Postman Me:
1. **Method:** GET
2. **URL:** `http://localhost:3000/health`

---

## Expected Responses:

### Register Success (201):
```json
{
  "success": true,
  "message": "User successfully created",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Login Success (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Error Response (400/401):
```json
{
  "success": false,
  "message": "Invalid email ya password"
}
```

---

## Testing Steps:

1. **Pehle Register karo** - Naya user create karo
2. **Phir Login karo** - Same credentials se login karo
3. **Token save karo** - Response me mila token ko copy karo (Angular me use hoga)

---

## Quick Test (PowerShell me):

### Register:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"test123"}'
```


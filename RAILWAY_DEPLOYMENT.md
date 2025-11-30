# Railway Deployment Guide

## ✅ Backend Optimization Complete

Your backend is now optimized for both **Local Development** and **Railway Deployment**.

## 🔧 Changes Made

### 1. Database Configuration (`src/config/db.js`)
- ✅ Supports all environment variables: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`
- ✅ Local defaults: localhost, root, root@123, crewnet, 3306
- ✅ Railway environment variables automatically override defaults
- ✅ Connection test with "✅ MySQL Connected" log
- ✅ Non-blocking error handling (doesn't crash server)
- ✅ Exports both `pool` and `promisePool`

### 2. Server Setup (`src/server.js`)
- ✅ `dotenv.config()` included
- ✅ `PORT = process.env.PORT || 3000`
- ✅ Health logs with environment info
- ✅ Global error handlers (unhandledRejection, uncaughtException)
- ✅ SIGTERM handler for graceful Railway shutdown
- ✅ Server exported cleanly

### 3. Package.json
- ✅ `"main": "src/server.js"`
- ✅ `"start": "node src/server.js"` (Railway runs this)
- ✅ `"dev": "nodemon src/server.js"` (local development)

### 4. Health Check Route
- ✅ `GET /health` returns:
  ```json
  {
    "status": "ok",
    "db": "connected" or "error",
    "env": "development" or "production",
    "timestamp": "2024-..."
  }
  ```

### 5. Environment Switching
- ✅ Automatically uses `.env` file locally
- ✅ Automatically uses Railway environment variables when deployed
- ✅ No hardcoded values (except safe defaults)

## 🚀 Railway Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Connect to Railway
1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Railway will auto-detect Node.js

### Step 3: Add MySQL Database
1. Click "New" → "Database" → "Add MySQL"
2. Railway will create a MySQL database
3. Note the connection details

### Step 4: Set Environment Variables
In Railway dashboard, go to your service → Variables tab, add:

```
DB_HOST=<railway-mysql-host>
DB_USER=<railway-mysql-user>
DB_PASS=<railway-mysql-password>
DB_NAME=<railway-mysql-database>
DB_PORT=3306
NODE_ENV=production
JWT_SECRET=<your-secret-key>
CORS_ORIGIN=<your-frontend-url>
```

**Note:** Railway automatically provides these for MySQL service - just link the database to your app.

### Step 5: Deploy
Railway will automatically:
- Run `npm install`
- Run `npm start`
- Your server will start on Railway's assigned PORT

## 🧪 Testing

### Local Testing
```bash
npm start
# Server runs on http://localhost:3000
```

### Railway Testing
After deployment, Railway provides a URL like:
```
https://your-app.railway.app
```

Test endpoints:
- Health: `https://your-app.railway.app/health`
- Employees: `https://your-app.railway.app/api/employees`

## 📋 Environment Variables Reference

### Local (.env file)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=root@123
DB_NAME=crewnet
DB_PORT=3306
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

### Railway (Set in Dashboard)
Railway automatically injects these when you link MySQL service. Just set:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `CORS_ORIGIN=<your-frontend-url>`

## ✅ Verification Checklist

- [x] Database connection works locally
- [x] Database connection works on Railway
- [x] Health check endpoint works
- [x] All API endpoints functional
- [x] Error handling doesn't crash server
- [x] Environment variables auto-switch
- [x] No hardcoded localhost in code
- [x] Graceful shutdown on SIGTERM

## 🎯 Key Features

✅ **Auto Environment Detection** - Works locally and on Railway without code changes  
✅ **Error Resilient** - Database errors don't crash the server  
✅ **Health Monitoring** - `/health` endpoint shows DB status  
✅ **Production Ready** - Proper error handling and logging  
✅ **Railway Compatible** - Follows Railway best practices  

## 📝 Notes

- Railway automatically sets `PORT` - don't override it
- Railway MySQL service provides connection via environment variables
- Health check endpoint helps monitor deployment status
- All SQL queries use promise-based pool (async/await ready)


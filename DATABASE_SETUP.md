# MySQL Database Setup Guide

## Step 1: MySQL Install Karo (Agar nahi hai)

1. MySQL Download karo: https://dev.mysql.com/downloads/mysql/
2. Install karo aur password set karo
3. MySQL Workbench install karo (optional, but helpful)

## Step 2: Database Create Karo

### Option A: MySQL Command Line se

```bash
# MySQL me login karo
mysql -u root -p

# Password enter karo, phir ye commands run karo:
```

```sql
-- Database create karo
CREATE DATABASE crewnet;

-- Database use karo
USE crewnet;

-- Users table create karo
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table create karo (agar chahiye)
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(50) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  joiningDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Option B: MySQL Workbench se

1. MySQL Workbench open karo
2. Local instance connect karo
3. New SQL tab open karo
4. Upar wale SQL commands paste karo
5. Execute button click karo

## Step 3: .env File Setup

Project root me `.env` file me ye values dalo:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=crewnet
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (kisi bhi random string ko use karo)
JWT_SECRET=your-super-secret-key-12345

# CORS (Angular app ka URL)
CORS_ORIGIN=http://localhost:4200
```

**Important:** `DB_PASS` me apna MySQL password dalo aur `JWT_SECRET` me koi strong random string dalo.

## Step 4: Test Karo

Server restart karo:
```bash
npm start
```

Agar sab sahi hai to console me dikhega:
```
✅ MySQL Connected
🚀 Server running on port 3000
```


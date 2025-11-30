-- CrewNet Database Setup
-- Ye SQL file run karo MySQL me pehle

-- Database create karo (agar already nahi hai)
CREATE DATABASE IF NOT EXISTS crewnet;
USE crewnet;

-- Users table create karo
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Test user insert karo (password: "test123" - ye hashed hai)
-- Production me ye remove kar dena
INSERT INTO users (name, email, password) 
VALUES (
  'Test User', 
  'test@example.com', 
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
);

-- Note: Real password hash generate karne ke liye register API use karo
-- Ya bcrypt se manually hash karo


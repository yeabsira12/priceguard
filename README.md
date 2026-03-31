PriceGuard - Smart Subscription Tracker

A full-stack web application to track and manage monthly subscriptions with real-time analytics and budget alerts.


 🚀 Getting Started - Run in 2 Minutes

 Prerequisites
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MySQL** (v8+) - [Download](https://mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

 Quick Start Guide

 Step 1: Clone & Install
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/priceguard.git
cd priceguard

# Install backend dependencies
cd backend
npm install
Step 2: Setup Database
bash
# Login to MySQL
mysql -u root -p

# Run these SQL commands
CREATE DATABASE priceguard;
USE priceguard;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    monthly_budget DECIMAL(10,2) DEFAULT 500.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    billing_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exit MySQL
EXIT;
Step 3: Configure Environment Variables
bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
# Open .env in any text editor and update:
# DB_PASSWORD=your_mysql_password
Your .env file should look like:

env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=priceguard
JWT_SECRET=your_secret_key_here
PORT=5000
Step 4: Start the Application
bash
# Start the backend server (from backend folder)
npm run dev

# Expected output:
# 🚀 PriceGuard Server Running!
# 📍 http://localhost:5000
# ✅ Database connected successfully
Step 5: Open the Frontend
Option A: Double-click frontend/index.html in your file explorer

Option B: Use VS Code Live Server (right-click → Open with Live Server)

Option C: Run a local server:

bash
cd ../frontend
python -m http.server 8000
# Then open http://localhost:8000
Step 6: Test the Application
Register a new account

Login with your credentials

Add subscriptions (Netflix, Spotify, etc.)

View dashboard with charts and analytics

Delete/Edit subscriptions

✅ Success! Your app should now be running at:
Frontend: http://localhost:5000 (if using Live Server) or http://localhost:8000

Backend API: http://localhost:5000/api

🐛 Troubleshooting Common Issues
Issue: Error: ER_ACCESS_DENIED_ERROR
Fix: Check your MySQL password in .env file

Issue: Error: Cannot find module 'express'
Fix: Run npm install in the backend folder

Issue: Port 5000 already in use
Fix: Change PORT=5001 in .env file

Issue: Database connection refused
Fix: Make sure MySQL is running: net start MySQL80 (Windows) or sudo service mysql start (Mac/Linux)

text

---

## 2️⃣ **Fix: Add Loading Spinners & Toast Notifications**

### **Add this CSS to all frontend HTML files (inside `<style>` tag):**

```css
/* Loading Spinner */
.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Toast Notifications */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-success {
    background: linear-gradient(135deg, #10b981, #059669);
}

.toast-error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast-info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

/* Button Loading State */
.btn-loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
}

.btn-loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    right: 15px;
    margin-top: -8px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
}
# Clone the repository
git clone https://github.com/YOUR_USERNAME/priceguard.git
cd priceguard

# Install backend dependencies
cd backend
npm install
  > Features

- 🔐 Secure Authentication - JWT with password hashing
- 📊 Interactive Dashboard - Real-time spending charts
- 💰 Budget Tracking - Set and monitor monthly budgets
- 📱 Responsive Design - Works on all devices
- 🎨 Modern UI - Glassmorphism design with animations

🛠️ Tech Stack

 Backend:
- Node.js & Express.js
- MySQL with connection pooling
- JWT Authentication
- bcrypt for passwords

 Frontend:
- HTML5, CSS3, JavaScript
- Chart.js for data visualization
- Responsive CSS Grid/Flexbox

 🚀 Live Demo

[Coming Soon]

 📋 Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/priceguard.git

// Add this near the top of server.js after other imports
const axios = require('axios');

// Add a scheduled job to check for upcoming bills (optional)
const checkUpcomingBills = async () => {
    try {
        const [users] = await pool.query('SELECT id, email FROM users');
        
        for (const user of users) {
            const [bills] = await pool.query(
                `SELECT * FROM subscriptions 
                 WHERE user_id = ? 
                 AND billing_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)`,
                [user.id]
            );
            
            if (bills.length > 0) {
                console.log(`🔔 User ${user.id} has ${bills.length} upcoming bills`);
                // You can add email notification here
            }
        }
    } catch (error) {
        console.error('Error checking bills:', error);
    }
};

// Run check every day (optional)
// setInterval(checkUpcomingBills, 24 * 60 * 60 * 1000);
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'PriceGuard API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            subscriptions: '/api/subscriptions',
            dashboard: '/api/subscriptions/dashboard'
        }
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 PriceGuard Server Running!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    
    // Test database connection
    await testConnection();
    
    console.log(`\n✨ Ready to accept requests!\n`);
});
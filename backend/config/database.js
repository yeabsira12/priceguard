const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for Aiven MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,          // e.g., priceguard-db-...aivencloud.com
    port: process.env.DB_PORT,          // e.g., 27852 (required)
    user: process.env.DB_USER,          // e.g., avnadmin
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,      // e.g., defaultdb or priceguard_db
    ssl: {
        // For Aiven, you must enable SSL. 
        // Using rejectUnauthorized: false is simpler (no need to upload ca.pem)
        rejectUnauthorized: false
        // If you want full verification, use ca: fs.readFileSync("/etc/secrets/ca.pem")
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection function
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
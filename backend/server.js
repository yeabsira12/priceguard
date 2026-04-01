const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const aiRoutes = require('./routes/ai');  // ← ADD THIS

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);  // ← ADD THIS

app.get('/', (req, res) => {
    res.json({ message: 'PriceGuard API is running!' });
});

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await testConnection();
});
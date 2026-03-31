const express = require('express');
const { pool } = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for logged in user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [subscriptions] = await pool.query(
            'SELECT * FROM subscriptions WHERE user_id = ? AND is_active = true ORDER BY billing_date ASC',
            [req.user.id]
        );
        
        res.json({ 
            success: true, 
            data: subscriptions 
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching subscriptions' 
        });
    }
});

// @route   POST /api/subscriptions
// @desc    Add a new subscription
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
    const { name, price, category, billing_date, currency } = req.body;

    // Validate required fields
    if (!name || !price || !category || !billing_date) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide name, price, category, and billing date' 
        });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO subscriptions (user_id, name, price, category, billing_date, currency) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, name, price, category, billing_date, currency || 'USD']
        );

        // Get the newly created subscription
        const [newSubscription] = await pool.query(
            'SELECT * FROM subscriptions WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({ 
            success: true, 
            data: newSubscription[0],
            message: 'Subscription added successfully'
        });
    } catch (error) {
        console.error('Error adding subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding subscription' 
        });
    }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update a subscription
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
    const subscriptionId = req.params.id;
    const { name, price, category, billing_date, is_active } = req.body;

    try {
        // First check if subscription belongs to user
        const [check] = await pool.query(
            'SELECT id FROM subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, req.user.id]
        );

        if (check.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        // Update subscription
        await pool.query(
            `UPDATE subscriptions 
             SET name = ?, price = ?, category = ?, billing_date = ?, is_active = ? 
             WHERE id = ?`,
            [name, price, category, billing_date, is_active !== undefined ? is_active : true, subscriptionId]
        );

        res.json({ 
            success: true, 
            message: 'Subscription updated successfully' 
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating subscription' 
        });
    }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete a subscription
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
    const subscriptionId = req.params.id;

    try {
        // Check if subscription belongs to user
        const [check] = await pool.query(
            'SELECT id FROM subscriptions WHERE id = ? AND user_id = ?',
            [subscriptionId, req.user.id]
        );

        if (check.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        // Delete subscription
        await pool.query(
            'DELETE FROM subscriptions WHERE id = ?',
            [subscriptionId]
        );

        res.json({ 
            success: true, 
            message: 'Subscription deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting subscription' 
        });
    }
});

// @route   GET /api/subscriptions/dashboard
// @desc    Get dashboard data (total, budget, category totals)
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get user's budget and currency
        const [userData] = await pool.query(
            'SELECT monthly_budget, currency FROM users WHERE id = ?',
            [req.user.id]
        );

        // Get total monthly spending
        const [totalResult] = await pool.query(
            'SELECT SUM(price) as total FROM subscriptions WHERE user_id = ? AND is_active = true',
            [req.user.id]
        );

        // Get spending by category (for pie chart)
        const [categoryTotals] = await pool.query(
            'SELECT category, SUM(price) as total FROM subscriptions WHERE user_id = ? AND is_active = true GROUP BY category',
            [req.user.id]
        );

        // Get upcoming bills (next 30 days)
        const [upcomingBills] = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE user_id = ? AND is_active = true 
             AND billing_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
             ORDER BY billing_date ASC`,
            [req.user.id]
        );

        const totalSpending = totalResult[0]?.total || 0;
        const monthlyBudget = userData[0]?.monthly_budget || 500;
        const remainingBudget = monthlyBudget - totalSpending;
        const isOverBudget = remainingBudget < 0;

        res.json({
            success: true,
            data: {
                total_spending: totalSpending,
                monthly_budget: monthlyBudget,
                remaining_budget: remainingBudget,
                is_over_budget: isOverBudget,
                category_breakdown: categoryTotals,
                upcoming_bills: upcomingBills,
                currency: userData[0]?.currency || 'USD'
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dashboard data' 
        });
    }
});

module.exports = router;
// Add this to your existing subscriptions.js file

// @route   GET /api/subscriptions/convert
// @desc    Convert amount to user's preferred currency
// @access  Private
router.get('/convert', authenticateToken, async (req, res) => {
    const { amount, from_currency = 'USD', to_currency } = req.query;
    
    if (!amount || !to_currency) {
        return res.status(400).json({ 
            success: false, 
            message: 'Amount and target currency required' 
        });
    }
    
    try {
        // Get user's currency preference
        const [user] = await pool.query(
            'SELECT currency FROM users WHERE id = ?',
            [req.user.id]
        );
        
        const targetCurrency = to_currency || user[0]?.currency || 'USD';
        
        // ExchangeRate-API (free tier)
        // You can get a free API key at: https://app.exchangerate-api.com/sign-up
        const API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'your-api-key-here';
        
        // For demo purposes, using mock conversion rates
        // In production, use actual API call:
        /*
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${from_currency}`,
            { params: { api_key: API_KEY } }
        );
        const rate = response.data.rates[targetCurrency];
        */
        
        // Mock rates for development (remove in production)
        const mockRates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            INR: 83.12,
            JPY: 110.25,
            CAD: 1.25
        };
        
        const rate = mockRates[targetCurrency] || 1;
        const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
        
        res.json({
            success: true,
            data: {
                original_amount: parseFloat(amount),
                original_currency: from_currency,
                converted_amount: convertedAmount,
                target_currency: targetCurrency,
                exchange_rate: rate
            }
        });
        
    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Currency conversion failed' 
        });
    }
});

// @route   PUT /api/users/settings
// @desc    Update user preferences (currency, budget)
// @access  Private
router.put('/users/settings', authenticateToken, async (req, res) => {
    const { currency, monthly_budget } = req.body;
    
    try {
        await pool.query(
            'UPDATE users SET currency = ?, monthly_budget = ? WHERE id = ?',
            [currency || 'USD', monthly_budget || 500, req.user.id]
        );
        
        res.json({ 
            success: true, 
            message: 'Settings updated successfully' 
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update settings' 
        });
    }
});
// @route   GET /api/subscriptions/analytics
// @desc    Get advanced analytics data
// @access  Private
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        // Monthly spending trend (last 6 months)
        const [monthlyTrend] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(price) as total
            FROM subscriptions
            WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `, [req.user.id]);
        
        // Most expensive subscription
        const [mostExpensive] = await pool.query(`
            SELECT name, price, category
            FROM subscriptions
            WHERE user_id = ? AND is_active = true
            ORDER BY price DESC
            LIMIT 1
        `, [req.user.id]);
        
        // Total savings if you canceled all (example)
        const totalSpending = monthlyTrend.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const averageMonthly = totalSpending / monthlyTrend.length;
        
        res.json({
            success: true,
            data: {
                monthly_trend: monthlyTrend,
                most_expensive: mostExpensive[0] || null,
                average_monthly: averageMonthly.toFixed(2),
                yearly_projection: (averageMonthly * 12).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load analytics' 
        });
    }
});
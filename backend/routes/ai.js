const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const aiService = require('../services/aiservice');

// POST: Ask a question
router.post('/ask', authenticateToken, async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide a question' 
        });
    }
    
    try {
        const result = await aiService.ask(req.user.id, question);
        res.json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        console.error('AI error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing your question' 
        });
    }
});

// GET: Get insights (summary)
router.get('/insights', authenticateToken, async (req, res) => {
    try {
        const data = await aiService.getUserData(req.user.id);
        
        res.json({
            success: true,
            data: {
                totalSpending: data.totalSpending,
                subscriptionCount: data.count,
                budget: data.user?.monthly_budget || 500,
                subscriptions: data.subscriptions.map(s => ({
                    name: s.name,
                    price: s.price,
                    category: s.category
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
const { pool } = require('../config/database');

class AIService {
    
    // Get all user data from database
    async getUserData(userId) {
        try {
            // Get user info
            const [user] = await pool.query(
                'SELECT name, monthly_budget FROM users WHERE id = ?',
                [userId]
            );
            
            // Get all subscriptions
            const [subscriptions] = await pool.query(
                'SELECT * FROM subscriptions WHERE user_id = ? AND is_active = true',
                [userId]
            );
            
            // Calculate total spending
            const totalSpending = subscriptions.reduce((sum, s) => sum + parseFloat(s.price), 0);
            
            return {
                user: user[0] || { monthly_budget: 500 },
                subscriptions: subscriptions,
                totalSpending: totalSpending,
                count: subscriptions.length
            };
            
        } catch (error) {
            console.error('getUserData error:', error);
            throw error;
        }
    }
    
    // Answer questions based on patterns
    answerQuestion(question, data) {
        const q = question.toLowerCase();
        
        // Question 1: How much am I spending?
        if (q.includes('total') || q.includes('spending') || q.includes('how much')) {
            return `💰 You're spending $${data.totalSpending.toFixed(2)} per month on ${data.count} subscription(s).`;
        }
        
        // Question 2: Most expensive subscription
        if (q.includes('most expensive') || q.includes('highest') || q.includes('largest')) {
            if (data.subscriptions.length === 0) {
                return "📭 You don't have any subscriptions yet. Add some to get insights!";
            }
            const sorted = [...data.subscriptions].sort((a, b) => b.price - a.price);
            const mostExpensive = sorted[0];
            return `💎 Your most expensive subscription is **${mostExpensive.name}** at $${mostExpensive.price}/month.`;
        }
        
        // Question 3: Budget check
        if (q.includes('budget')) {
            const budget = data.user?.monthly_budget || 500;
            if (data.totalSpending > budget) {
                const overage = data.totalSpending - budget;
                return `⚠️ You're $${overage.toFixed(2)} **over** your $${budget} monthly budget. Consider reviewing your subscriptions!`;
            } else {
                const remaining = budget - data.totalSpending;
                return `✅ You're **within budget**! You have $${remaining.toFixed(2)} remaining this month.`;
            }
        }
        
        // Question 4: What to cancel?
        if (q.includes('cancel') || q.includes('remove') || q.includes('stop')) {
            if (data.subscriptions.length === 0) {
                return "📭 You have no subscriptions to cancel.";
            }
            const expensive = data.subscriptions.filter(s => s.price > 15);
            if (expensive.length > 0) {
                const suggestions = expensive.map(s => `${s.name} ($${s.price})`).join(', ');
                return `❌ Consider reviewing these expensive subscriptions: ${suggestions}. Ask yourself if you're getting enough value from each.`;
            }
            return "💚 All your subscriptions are reasonably priced (under $15). No urgent cancellations needed!";
        }
        
        // Question 5: How to save money?
        if (q.includes('save') || q.includes('saving') || q.includes('save money')) {
            if (data.subscriptions.length === 0) {
                return "💰 You have no subscriptions to save on! You're already saving 100%!";
            }
            const expensive = data.subscriptions.filter(s => s.price > 20);
            if (expensive.length > 0) {
                const totalExpensive = expensive.reduce((sum, s) => sum + s.price, 0);
                return `💡 You could save $${totalExpensive.toFixed(2)}/month by reviewing these: ${expensive.map(s => s.name).join(', ')}. Consider: 1) Using free trials 2) Sharing family plans 3) Paying annually for discounts.`;
            }
            return "💡 You're doing well! To save more: 1) Look for annual plans (usually 15-20% off) 2) Share with family 3) Use student discounts if applicable.";
        }
        
        // Question 6: List all subscriptions
        if (q.includes('list') || q.includes('show me') || q.includes('what subscriptions')) {
            if (data.subscriptions.length === 0) {
                return "📭 You have no subscriptions yet. Add some to see them here!";
            }
            const list = data.subscriptions.map(s => `• ${s.name}: $${s.price} (${s.category})`).join('\n');
            return `📋 Your subscriptions:\n${list}`;
        }
        
        // Question 7: Spending by category
        if (q.includes('category')) {
            if (data.subscriptions.length === 0) {
                return "📭 No subscriptions to categorize.";
            }
            const byCategory = {};
            data.subscriptions.forEach(s => {
                if (!byCategory[s.category]) byCategory[s.category] = 0;
                byCategory[s.category] += s.price;
            });
            const categoryList = Object.entries(byCategory)
                .map(([cat, total]) => `• ${cat}: $${total.toFixed(2)}`)
                .join('\n');
            return `📊 Spending by category:\n${categoryList}`;
        }
        
        // Default response with help
        return `🤖 I can help you with:
• "How much am I spending?" - See total monthly cost
• "Most expensive subscription" - Find highest cost
• "Am I over budget?" - Check budget status
• "What should I cancel?" - Get cancellation suggestions
• "How can I save money?" - Get saving tips
• "List subscriptions" - See all your subscriptions
• "Spending by category" - See category breakdown

What would you like to know?`;
    }
    
    // Main method to ask a question
    async ask(userId, question) {
        try {
            const data = await this.getUserData(userId);
            const answer = this.answerQuestion(question, data);
            
            return {
                question: question,
                answer: answer,
                summary: {
                    totalSpending: data.totalSpending,
                    subscriptionCount: data.count,
                    budget: data.user?.monthly_budget || 500,
                    isOverBudget: data.totalSpending > (data.user?.monthly_budget || 500)
                }
            };
        } catch (error) {
            console.error('Ask error:', error);
            throw new Error('Failed to process your question');
        }
    }
}

// Export a single instance
module.exports = new AIService();
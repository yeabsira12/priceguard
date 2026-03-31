const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send bill reminder
async function sendBillReminder(email, name, subscription) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🔔 Reminder: ${subscription.name} bill due soon`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">PriceGuard Reminder</h2>
                <p>Hello ${name},</p>
                <p>Your subscription <strong>${subscription.name}</strong> of <strong>$${subscription.price}</strong> 
                is due on <strong>${new Date(subscription.billing_date).toLocaleDateString()}</strong>.</p>
                <p>Log in to PriceGuard to manage your subscriptions.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">PriceGuard - Smart Subscription Manager</p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

module.exports = { sendBillReminder };
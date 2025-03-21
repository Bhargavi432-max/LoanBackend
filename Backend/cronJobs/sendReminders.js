const cron = require('node-cron');
const Repayment = require('../models/Repayment');
const sendEmail = require('../utils/sendEmail');

cron.schedule('0 9 * * *', async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcomingPayments = await Repayment.find({ dueDate: tomorrow, status: 'Upcoming' });

        upcomingPayments.forEach(payment => {
            sendEmail(payment.userId, `Reminder: Your loan payment of ₹${payment.amount} is due tomorrow.`);
        });

        console.log('Payment reminders sent.');
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
});

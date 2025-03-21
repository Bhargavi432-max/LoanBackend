const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your email (Gmail)
        pass: process.env.EMAIL_PASS   // App password (not your Gmail password)
    }
});

const sendEmail = async (userEmail, message) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Loan Payment Reminder',
            text: message
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;

const express = require('express');
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/schedule/:loanId', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can schedule repayments' });
        }

        const loan = await Loan.findById(req.params.loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const existingRepayments = await Repayment.findOne({ loanId: loan._id });
        if (existingRepayments) {
            return res.status(400).json({ message: 'Repayment schedule already exists for this loan' });
        }

        const { tenure, interestRate, startDate } = req.body;
        const principal = loan.loanAmount;

        const monthlyInterest = (principal * interestRate) / (100 * 12);
        const emi = (principal / tenure) + monthlyInterest;

        let dueDate = new Date(startDate);
        const repayments = [];

        for (let i = 0; i < tenure; i++) {
            repayments.push({
                userId: loan.userId,
                loanId: loan._id,
                dueDate: new Date(dueDate),
                amount: emi.toFixed(2),
                status: 'Upcoming',
            });
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        await Repayment.insertMany(repayments);
        res.status(201).json({ message: 'Repayment schedule created successfully', schedule: repayments });
    } catch (error) {
        console.error('Error scheduling repayments:', error);
        res.status(500).json({ message: 'Error scheduling repayments', error: error.message });
    }
});


router.get('/calendar/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const repayments = await Repayment.find({ userId: req.params.userId }).sort({ dueDate: 1 });

        res.status(200).json({ repayments });
    } catch (error) {
        console.error('Error fetching repayment calendar:', error);
        res.status(500).json({ message: 'Error fetching repayment calendar', error: error.message });
    }
});

router.post('/send-reminders', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can trigger reminders' });
        }

        const today = new Date();
        const upcomingRepayments = await Repayment.find({
            dueDate: { $gte: today, $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
            status: 'Upcoming',
        }).populate('userId', 'email name');
        console.log(`Sending reminders for ${upcomingRepayments.length} repayments`);

        res.status(200).json({ message: 'Reminders sent successfully', count: upcomingRepayments.length });
    } catch (error) {
        console.error('Error sending reminders:', error);
        res.status(500).json({ message: 'Error sending reminders', error: error.message });
    }
});

module.exports = router;

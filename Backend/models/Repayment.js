const mongoose = require('mongoose');

const RepaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Upcoming', 'Overdue'], default: 'Upcoming' },
    paymentDate: { type: Date },
});

module.exports = mongoose.model('Repayment', RepaymentSchema);

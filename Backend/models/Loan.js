const mongoose = require("mongoose");

const LoanApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    income: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    documents: { type: String },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
    approvalDate: { type: Date }, 
    rejectionReason: { type: String }, 
    createdAt: { type: Date, default: Date.now },
});

const LoanApplication = mongoose.model("LoanApplication", LoanApplicationSchema);
module.exports = LoanApplication;

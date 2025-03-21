const express = require("express");
const LoanApplication = require("../models/Loan");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });
router.post("/apply", upload.single("document"), async (req, res) => {
    try {
        const { userId, name, email, phone, income, loanAmount } = req.body;
        if (!userId || !name || !email || !phone || !income || !loanAmount || !req.file) {
            return res.status(400).json({ message: "All fields are required, including the document" });
        }

        const newLoan = new LoanApplication({
            userId,
            name,
            email,
            phone,
            income,
            loanAmount,
            document: req.file.path, 
            status: "Pending"
        });

        await newLoan.save();
        res.status(201).json({ message: "Loan application submitted successfully", loan: newLoan });

    } catch (error) {
        console.error("Loan Application Error:", error.message);
        res.status(500).json({ message: "Error processing loan application" });
    }
});


router.get("/all-applications", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const loans = await LoanApplication.find();
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loan applications", error: error.message });
    }
});

router.get("/my-applications", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({ message: "Access denied." });
        }

        const loans = await LoanApplication.find({ userId: req.user.id });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loan applications", error: error.message });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const loan = await LoanApplication.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: "Loan application not found" });

        if (req.user.role !== "admin" && loan.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied." });
        }

        res.status(200).json(loan);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loan application", error: error.message });
    }
});

router.patch("/:id/approve", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const loan = await LoanApplication.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: "Loan application not found" });

        loan.status = "Approved";
        loan.approvalDate = new Date();
        await loan.save();

        res.status(200).json({ message: "Loan application approved", loan });
    } catch (error) {
        res.status(500).json({ message: "Error approving loan application", error: error.message });
    }
});

router.patch("/:id/reject", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { rejectionReason } = req.body;
        const loan = await LoanApplication.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: "Loan application not found" });

        loan.status = "Rejected";
        loan.rejectionReason = rejectionReason;
        await loan.save();

        res.status(200).json({ message: "Loan application rejected", loan });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting loan application", error: error.message });
    }
});

module.exports = router;

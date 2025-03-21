const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"], 
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"]
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"]
    },
    password: { 
        type: String, 
        required: [true, "Password is required"], 
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function(value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
            },
            message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        }
    },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

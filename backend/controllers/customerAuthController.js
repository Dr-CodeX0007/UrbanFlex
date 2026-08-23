const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const signToken = (customer) =>
    jwt.sign(
        { id: customer._id, email: customer.email, name: customer.name, role: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

// SIGNUP
const signupCustomer = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existing = await Customer.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please log in instead."
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashed,
            phone: phone || ""
        });

        const token = signToken(customer);

        res.status(201).json({
            success: true,
            token,
            customer: { id: customer._id, name: customer.name, email: customer.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Signup failed. Please try again."
        });
    }
};

// LOGIN
const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ email: (email || "").toLowerCase().trim() });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, customer.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = signToken(customer);

        res.json({
            success: true,
            token,
            customer: { id: customer._id, name: customer.name, email: customer.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
};

// GET current logged-in customer's profile (used to verify a saved token on page load)
const getMyProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer.id).select("-password");

        if (!customer) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        res.json({ success: true, customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to load profile." });
    }
};

module.exports = { signupCustomer, loginCustomer, getMyProfile };
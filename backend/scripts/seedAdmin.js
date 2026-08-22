// Run once: node backend/scripts/seedAdmin.js
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env and creates the admin login.
// Safe to re-run - it will update the password if the admin already exists.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const run = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const mongoUri = process.env.MONGO_URI;

    console.log("Loaded MONGO_URI:", mongoUri ? "found (" + mongoUri.length + " chars)" : "MISSING");
    console.log("Loaded ADMIN_EMAIL:", email || "MISSING");

    if (!mongoUri) {
        console.error("MONGO_URI not found. Make sure you're running this command from the project root folder (where .env lives), and that .env has a line like: MONGO_URI=mongodb+srv://...");
        process.exit(1);
    }

    if (!email || !password) {
        console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashed = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
        existing.password = hashed;
        await existing.save();
        console.log(`Admin password updated for ${email}`);
    } else {
        await Admin.create({ email: email.toLowerCase().trim(), password: hashed });
        console.log(`Admin created: ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
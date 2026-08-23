const express = require("express");
const router = express.Router();
const protectCustomer = require("../middleware/customerAuthMiddleware");

const {
    signupCustomer,
    loginCustomer,
    getMyProfile
} = require("../controllers/customerAuthController");

router.post("/signup", signupCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectCustomer, getMyProfile);

module.exports = router;
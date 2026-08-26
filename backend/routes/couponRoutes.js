const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/authMiddleware");

const {
    getAllCoupons,
    validateCoupon,
    createCoupon,
    deleteCoupon
} = require("../controllers/couponController");

// Public
router.post("/validate", validateCoupon);

// Admin only
router.get("/", protectAdmin, getAllCoupons);
router.post("/", protectAdmin, createCoupon);
router.delete("/:id", protectAdmin, deleteCoupon);

module.exports = router;
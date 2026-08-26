const Coupon = require("../models/Coupon");

// GET all coupons (admin only)
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to load coupons." });
    }
};

// VALIDATE a coupon code against an order total (public - used at checkout)
const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Enter a coupon code." });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon || !coupon.isActive) {
            return res.status(404).json({ success: false, message: "Invalid or inactive coupon code." });
        }

        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: "This coupon has expired." });
        }

        if (orderTotal < coupon.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `This coupon needs a minimum order of ₹${coupon.minOrderValue}.`
            });
        }

        let discountAmount = coupon.discountType === "percent"
            ? Math.round((orderTotal * coupon.discountValue) / 100)
            : coupon.discountValue;

        discountAmount = Math.min(discountAmount, orderTotal);

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to validate coupon." });
    }
};

// CREATE coupon (admin only)
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, expiryDate, isActive } = req.body;

        if (!code || !discountType || !discountValue) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type and discount value are required."
            });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase().trim(),
            discountType,
            discountValue,
            minOrderValue: minOrderValue || 0,
            expiryDate: expiryDate || null,
            isActive: isActive !== undefined ? !!isActive : true
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "This coupon code already exists." });
        }
        res.status(500).json({ success: false, message: "Unable to create coupon." });
    }
};

// DELETE coupon (admin only)
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }

        res.json({ success: true, message: "Coupon deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to delete coupon." });
    }
};

module.exports = {
    getAllCoupons,
    validateCoupon,
    createCoupon,
    deleteCoupon
};
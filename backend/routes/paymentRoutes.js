const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

console.log("Loaded paymentRoutes");

// Create Razorpay Order
router.post("/create-order", (req, res, next) => {
    console.log("✅ create-order route hit");
    next();
}, paymentController.createOrder);

router.post("/verify", paymentController.verifyPayment);
console.log("Registered routes:");

router.stack.forEach((layer) => {
    if (layer.route) {
        console.log(
            Object.keys(layer.route.methods).join(",").toUpperCase(),
            layer.route.path
        );
    }
});

module.exports = router;
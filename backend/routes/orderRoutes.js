const express = require("express");

const router = express.Router();

const protectCustomer = require("../middleware/customerAuthMiddleware");

const {

    getAllOrders,

    getMyOrders,

    saveOrder,

    updateOrderStatus,

    deleteOrder

} = require("../controllers/orderController");

router.get("/", getAllOrders);

router.get("/my-orders", protectCustomer, getMyOrders);

router.post("/", saveOrder);

// Update Order Status
router.put("/:id/status", updateOrderStatus);

// Delete Order
router.delete("/:id", deleteOrder);

module.exports = router;
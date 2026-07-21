const express = require("express");

const router = express.Router();

const {

    getAllOrders,

    saveOrder,

    updateOrderStatus,

    deleteOrder

} = require("../controllers/orderController");

router.get("/", getAllOrders);

router.post("/", saveOrder);

// Update Order Status
router.put("/:id/status", updateOrderStatus);

// Delete Order
router.delete("/:id", deleteOrder);

module.exports = router;
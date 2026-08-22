const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/authMiddleware");

const {
    getAllProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// Public
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

// Admin only
router.post("/", protectAdmin, createProduct);
router.put("/:id", protectAdmin, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

module.exports = router;
const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/authMiddleware");

const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Public
router.get("/", getAllCategories);

// Admin only
router.post("/", protectAdmin, createCategory);
router.put("/:id", protectAdmin, updateCategory);
router.delete("/:id", protectAdmin, deleteCategory);

module.exports = router;
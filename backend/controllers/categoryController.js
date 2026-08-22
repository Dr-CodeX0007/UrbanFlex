const Category = require("../models/Category");

const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

// GET all categories (public)
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to load categories." });
    }
};

// CREATE category (admin only)
const createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: slugify(name),
            image: image || ""
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Category already exists." });
        }
        res.status(500).json({ success: false, message: "Unable to create category." });
    }
};

// UPDATE category (admin only)
const updateCategory = async (req, res) => {
    try {
        const { name, image } = req.body;
        const update = {};

        if (name) {
            update.name = name.trim();
            update.slug = slugify(name);
        }
        if (image !== undefined) update.image = image;

        const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        res.json({ success: true, category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to update category." });
    }
};

// DELETE category (admin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        res.json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to delete category." });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
const Product = require("../models/Product");

const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

// GET all products (public) - supports ?category= and ?search= and ?sort=price_asc|price_desc
const getAllProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: "i" };

        const products = await Product.find(filter).populate("category", "name slug");

        let result = products;

        if (sort === "price_asc") {
            result = [...products].sort((a, b) => a.price - b.price);
        } else if (sort === "price_desc") {
            result = [...products].sort((a, b) => b.price - a.price);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to load products." });
    }
};

// GET single product by slug (public)
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to load product." });
    }
};

// CREATE product (admin only)
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            images,
            mrp,
            discountPercent,
            description,
            bulletPoints,
            deliveryDays,
            isBestseller,
            stock
        } = req.body;

        if (!name || !category || !mrp) {
            return res.status(400).json({
                success: false,
                message: "Name, category and MRP are required."
            });
        }

        let slug = slugify(name);
        const existing = await Product.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const product = await Product.create({
            name: name.trim(),
            slug,
            category,
            images: Array.isArray(images) ? images : [],
            mrp,
            discountPercent: discountPercent || 0,
            description: description || "",
            bulletPoints: Array.isArray(bulletPoints) ? bulletPoints : [],
            deliveryDays: deliveryDays || 5,
            isBestseller: !!isBestseller,
            stock: stock ?? 100
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to create product." });
    }
};

// UPDATE product (admin only)
const updateProduct = async (req, res) => {
    try {
        const update = { ...req.body };

        if (update.name) {
            update.slug = slugify(update.name);
        }

        const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to update product." });
    }
};

// DELETE product (admin only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to delete product." });
    }
};

module.exports = {
    getAllProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
};
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        images: {
            type: [String],
            default: []
        },
        mrp: {
            type: Number,
            required: true
        },
        discountPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 90
        },
        description: {
            type: String,
            default: ""
        },
        bulletPoints: {
            type: [String],
            default: []
        },
        deliveryDays: {
            type: Number,
            default: 5
        },
        rating: {
            type: Number,
            default: 4.5
        },
        reviews: {
            type: Number,
            default: 0
        },
        isBestseller: {
            type: Boolean,
            default: false
        },
        stock: {
            type: Number,
            default: 100
        }
    },
    { timestamps: true }
);

// Final customer-facing price, derived from MRP and discount
productSchema.virtual("price").get(function () {
    return Math.round(this.mrp - (this.mrp * this.discountPercent) / 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
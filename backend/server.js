const express = require("express");
console.log("SERVER FILE:", __filename);
const cors = require("cors");
require("dotenv").config({
    path: ".env"
});

const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
    origin: ['https://urbanflex-store.netlify.app', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("UrbanFlex Backend Running Successfully 🚀");
});
app.get("/test123", (req, res) => {
    res.send("TEST ROUTE WORKING");
});

app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerAuthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
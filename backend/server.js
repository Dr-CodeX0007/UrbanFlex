const express = require("express");
console.log("SERVER FILE:", __filename);
const cors = require("cors");
require("dotenv").config({
    path: ".env"
});

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("UrbanFlex Backend Running Successfully 🚀");
});
app.get("/test123", (req, res) => {
    res.send("TEST ROUTE WORKING");
});

app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
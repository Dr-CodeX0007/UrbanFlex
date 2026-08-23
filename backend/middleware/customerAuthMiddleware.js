const jwt = require("jsonwebtoken");

// Protects routes that require a logged-in customer.
// Checks role === "customer" so an admin token can never be reused here,
// and vice versa (see authMiddleware.js for the admin-only equivalent).
const protectCustomer = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, please log in."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "customer") {
            return res.status(401).json({
                success: false,
                message: "Not authorized as a customer."
            });
        }

        req.customer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Session expired, please log in again."
        });
    }
};

module.exports = protectCustomer;
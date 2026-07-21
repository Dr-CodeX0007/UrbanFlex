const fs = require("fs");
const path = require("path");

const getAllProducts = (req, res) => {

    try {

        const filePath = path.join(__dirname, "..", "data", "products.json");

        const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

        res.status(200).json(products);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to load products."
        });

    }

};

module.exports = {
    getAllProducts
};
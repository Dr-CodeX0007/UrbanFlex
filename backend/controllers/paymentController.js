const Razorpay = require("razorpay");

console.log("KEY_ID =", process.env.RAZORPAY_KEY_ID);
console.log("KEY_SECRET exists =", !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {

    try {

        const { amount } = req.body;

        const options = {

            amount: amount * 100,
            currency: "INR",
            receipt: "UF_" + Date.now()

        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });

    } 
    catch (err) {
    console.error("FULL ERROR:");
    console.error(err);

    if (err.error) {
        console.error("RAZORPAY ERROR:");
        console.error(JSON.stringify(err.error, null, 2));
    }

    return res.status(500).json({
        success: false,
        message: err.error?.description || err.message || "Unknown Error"
    });
}

};
const crypto = require("crypto");

exports.verifyPayment = (req, res) => {

    try {

        const {

            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature

        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            return res.json({

                success: true,
                message: "Payment Verified"

            });

        }

        return res.status(400).json({

            success: false,
            message: "Invalid Signature"

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: "Verification Failed"

        });

    }

};
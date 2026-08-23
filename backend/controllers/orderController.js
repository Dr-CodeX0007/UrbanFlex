const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "orders.json");

// GET ALL ORDERS

const getAllOrders = (req, res) => {

    try {

        const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

        res.status(200).json(orders);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to load orders."

        });

    }

};

// SAVE ORDER

const saveOrder = (req, res) => {

    try {

        const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const newOrder = {

            id: Date.now(),

            customerName:req.body.customerName,

            phone:req.body.phone,

            email:req.body.email,

            address:req.body.address,
            
            items: Array.isArray(req.body.items)
            ? req.body.items
            : [],

            product:req.body.product,

            quantity:req.body.quantity,

            price:req.body.price,

            total:req.body.total,

            paymentStatus: req.body.paymentStatus || "Pending",
            paymentId: req.body.paymentId || "",

             orderId: req.body.orderId || "",

            orderStatus:"Pending",

            orderDate:new Date().toLocaleString()

        };

        orders.push(newOrder);

        fs.writeFileSync(filePath,JSON.stringify(orders,null,2));

        res.status(201).json({

            success:true,

            message:"Order Saved Successfully",

            order:newOrder

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to save order."

        });

    }

};
// UPDATE ORDER STATUS

const updateOrderStatus = (req, res) => {

    try {

        const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const orderId = Number(req.params.id);

        const { orderStatus } = req.body;

        const order = orders.find(item => item.id === orderId);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }

        order.orderStatus = orderStatus;

        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

        res.json({

            success: true,

            message: "Order status updated successfully.",

            order

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to update order."

        });

    }

};

// DELETE ORDER

const deleteOrder = (req, res) => {

    try {

        const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const orderId = Number(req.params.id);

        const updatedOrders = orders.filter(order => order.id !== orderId);

        fs.writeFileSync(filePath, JSON.stringify(updatedOrders, null, 2));

        res.json({

            success: true,

            message: "Order deleted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to delete order."

        });

    }

};

// GET ORDERS FOR THE LOGGED-IN CUSTOMER
// Matches by customerId when available (orders placed while logged in),
// falling back to email match (covers guest checkouts under the same email).

const getMyOrders = (req, res) => {

    try {

        const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const myEmail = (req.customer.email || "").toLowerCase();
        const myId = req.customer.id;

        const myOrders = orders.filter(order =>
            (order.customerId && order.customerId === myId) ||
            (order.email && order.email.toLowerCase() === myEmail)
        );

        myOrders.sort((a, b) => b.id - a.id);

        res.status(200).json(myOrders);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to load your orders."

        });

    }

};

module.exports = {

    getAllOrders,

    getMyOrders,

    saveOrder,

    updateOrderStatus,

    deleteOrder

};
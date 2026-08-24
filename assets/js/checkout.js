console.log("Hostname:", window.location.hostname);
console.log("API_BASE_URL:", API_BASE_URL);

// Prefill name/email if the shopper is logged in
if (typeof getCustomerData === "function") {
    const loggedInCustomer = getCustomerData();
    if (loggedInCustomer) {
        window.addEventListener("DOMContentLoaded", () => {
            const nameField = document.getElementById("name");
            const emailField = document.getElementById("email");
            if (nameField && !nameField.value) nameField.value = loggedInCustomer.name;
            if (emailField && !emailField.value) emailField.value = loggedInCustomer.email;
        });
    }
}

const buyNowOrder = JSON.parse(localStorage.getItem("currentOrder"));
const checkoutCart = JSON.parse(localStorage.getItem("checkoutCart")) || [];

let checkoutItems = [];

if (checkoutCart.length > 0) {

    checkoutItems = checkoutCart.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        image: item.image,
        size: item.size
    }));

} else if (buyNowOrder) {

    checkoutItems = [{
        id: buyNowOrder.id,
        name: buyNowOrder.name,
        price: Number(buyNowOrder.price),
        quantity: 1,
        image: buyNowOrder.image,
        size: buyNowOrder.size
    }];

} else {

    alert("No product selected.");
    window.location.href = "index.html";
}

const summary = document.getElementById("orderSummary");

const itemsTotal = checkoutItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
);

const handlingFee = 5;
const shippingFee = 0;

// checkoutTotal is the grand total actually charged (items + handling + shipping)
const checkoutTotal = itemsTotal + handlingFee + shippingFee;

summary.innerHTML = checkoutItems.map(item => `
    <div class="checkout-product">
        <img
            src="${item.image}"
            alt="${item.name}"
        >

        <div class="checkout-product-info">
            <h3>${item.name}</h3>
            ${item.size ? `<p class="checkout-item-size">Size: ${item.size}</p>` : ""}
            <p>Qty: ${item.quantity}</p>
        </div>

        <div class="checkout-product-price">₹${item.price * item.quantity}</div>
    </div>
`).join("") + `
    <div class="price-breakdown">
        <div class="breakdown-row">
            <span>Items Total</span>
            <span>₹${itemsTotal}</span>
        </div>
        <div class="breakdown-row">
            <span>Shipping</span>
            <span class="free-tag">FREE</span>
        </div>
        <div class="breakdown-row">
            <span>Handling Fee</span>
            <span>₹${handlingFee}</span>
        </div>
        <p class="gst-note">Inclusive of all taxes (GST included)</p>
        <div class="breakdown-row breakdown-total">
            <span>Grand Total</span>
            <span>₹${checkoutTotal}</span>
        </div>
    </div>
`;

document
.getElementById("payButton")
.addEventListener("click", startPayment);

async function startPayment() {

    const customer = {

        name: document.getElementById("name").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        email: document.getElementById("email").value.trim(),

        address:
    document.getElementById("address").value +
    ", " +
    document.getElementById("area").value +
    ", " +
    document.getElementById("city").value +
    ", " +
    document.getElementById("state").value +
    " - " +
    document.getElementById("pincode").value

    };

    if (
        !customer.name ||
        !customer.phone ||
        !customer.address
    ) {

        alert("Please fill all required fields.");

        return;

    }

    try {

    const url = `${API_BASE_URL}/api/payment/create-order`;
    console.log("Posting to:", url);

    const response = await fetch(
        url,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

           body: JSON.stringify({
    amount: checkoutTotal
})
        }
    );

        const data = await response.json();

        if (!data.success) {

            alert("Unable to create payment.");

            return;

        }

        openRazorpay(data.order, customer);

    } catch (err) {

        console.error(err);

        alert("Server Error.");

    }

}
function openRazorpay(razorpayOrder, customer) {

    const options = {

        key: "rzp_live_TGy0QCOsojIIqQ", // 👈 Apni Test Key ID yahan paste karo

        amount: razorpayOrder.amount,

        currency: "INR",

        name: "UrbanFlex",

        description: checkoutItems.length === 1
    ? checkoutItems[0].name
    : `${checkoutItems.length} UrbanFlex products`,

        image: "assets/images/logo.png",

        order_id: razorpayOrder.id,

        handler: async function (response) {

            try {

                const verify = await fetch
                (`${API_BASE_URL}/api/payment/verify`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify(response)

                    }
                );

                const result = await verify.json();

                if (result.success) {

                    await saveOrder(customer, response);

                }

                else {

                    alert("Payment Verification Failed");

                }

            }

            catch (err) {

                console.error(err);

                alert("Verification Error");

            }

        },

        prefill: {

            name: customer.name,

            email: customer.email,

            contact: customer.phone

        },

        theme: {

            color: "#ff6b00"

        },

        modal: {

            ondismiss: function () {

                alert("Payment Cancelled");

            }

        }

    };

    const rzp = new Razorpay(options);

    rzp.open();

}
async function saveOrder(customer, payment) {

    const loggedInCustomer = (typeof getCustomerData === "function") ? getCustomerData() : null;

    const orderData = {

        customerName: customer.name,

        customerId: loggedInCustomer ? loggedInCustomer.id : null,

        phone: customer.phone,

        email: customer.email,

        address: customer.address,

        items: checkoutItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            image: item.image
        })),

        // Backward-compatible fields
        product: checkoutItems.length === 1
            ? checkoutItems[0].name
            : checkoutItems.map(item => item.name).join(", "),

        quantity: checkoutItems.reduce(
            (total, item) => total + item.quantity,
            0
        ),

        price: checkoutTotal,

        total: checkoutTotal,

        paymentId: payment.razorpay_payment_id,

        orderId: payment.razorpay_order_id,

        paymentStatus: "Paid",

        orderStatus: "Pending"

    };

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/orders`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(orderData)
            }
        );

        const result = await response.json();

        if (result.success) {

            localStorage.removeItem("currentOrder");
            localStorage.removeItem("checkoutCart");

            alert(
                "✅ Payment Successful!\n\nYour order has been placed."
            );

            window.location.href = "index.html";

        } else {

            alert(
                "Payment received but order could not be saved."
            );

        }

    } catch (err) {

        console.error(err);

        alert("Server Error while saving order.");

    }

}
// ===============================
// PINCODE AUTO FILL (India Post API)
// ===============================

const pincodeInput = document.getElementById('pincode');
const cityInput = document.getElementById('city');
const areaInput = document.getElementById('area');
const stateSelect = document.getElementById('state');

pincodeInput.addEventListener('input', async () => {

    const pincode = pincodeInput.value.trim();

    // Sirf 6 digit hone par API call
    if (pincode.length !== 6) {
        cityInput.value = '';
        areaInput.value = '';
        return;
    }

    try {

        const response = await fetch(
            `https://api.postalpincode.in/pincode/${pincode}`
        );

        const data = await response.json();

        // API success check
        if (
            data[0].Status === 'Success' &&
            data[0].PostOffice &&
            data[0].PostOffice.length > 0
        ) {

            // Prefer Assandh if available, otherwise use first post office
                let postOffice = data[0].PostOffice.find(po =>
                    po.Name.toLowerCase().includes('assandh')
);

                if (!postOffice) {
                    postOffice = data[0].PostOffice[0];
}

// Auto-fill city (editable by customer)
cityInput.value = postOffice.District || '';

// Auto-fill area (editable by customer)
areaInput.value = postOffice.Name || '';

            // Auto select state in dropdown
            const apiState = postOffice.State;

            for (let option of stateSelect.options) {
                if (option.value === apiState) {
                    stateSelect.value = apiState;
                    break;
                }
            }

        } else {

            cityInput.value = '';
            areaInput.value = '';

            alert('Invalid Pincode');

        }

    } catch (error) {

        console.error('Pincode lookup failed:', error);

        alert('Unable to fetch location from pincode');

    }
});
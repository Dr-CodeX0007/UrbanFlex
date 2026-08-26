console.log("Hostname:", window.location.hostname);
console.log("API_BASE_URL:", API_BASE_URL);

// ===============================
// COUNTRY CODE + PHONE VALIDATION
// ===============================

const COUNTRY_CODES = [
    { name: "Afghanistan", code: "+93" }, { name: "Albania", code: "+355" },
    { name: "Algeria", code: "+213" }, { name: "Argentina", code: "+54" },
    { name: "Australia", code: "+61" }, { name: "Austria", code: "+43" },
    { name: "Bahrain", code: "+973" }, { name: "Bangladesh", code: "+880" },
    { name: "Belgium", code: "+32" }, { name: "Bhutan", code: "+975" },
    { name: "Brazil", code: "+55" }, { name: "Canada", code: "+1" },
    { name: "China", code: "+86" }, { name: "Colombia", code: "+57" },
    { name: "Denmark", code: "+45" }, { name: "Egypt", code: "+20" },
    { name: "Finland", code: "+358" }, { name: "France", code: "+33" },
    { name: "Germany", code: "+49" }, { name: "Ghana", code: "+233" },
    { name: "Greece", code: "+30" }, { name: "Hong Kong", code: "+852" },
    { name: "Hungary", code: "+36" }, { name: "Iceland", code: "+354" },
    { name: "India", code: "+91" }, { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" }, { name: "Iraq", code: "+964" },
    { name: "Ireland", code: "+353" }, { name: "Israel", code: "+972" },
    { name: "Italy", code: "+39" }, { name: "Japan", code: "+81" },
    { name: "Jordan", code: "+962" }, { name: "Kenya", code: "+254" },
    { name: "Kuwait", code: "+965" }, { name: "Malaysia", code: "+60" },
    { name: "Maldives", code: "+960" }, { name: "Mexico", code: "+52" },
    { name: "Nepal", code: "+977" }, { name: "Netherlands", code: "+31" },
    { name: "New Zealand", code: "+64" }, { name: "Nigeria", code: "+234" },
    { name: "Norway", code: "+47" }, { name: "Oman", code: "+968" },
    { name: "Pakistan", code: "+92" }, { name: "Philippines", code: "+63" },
    { name: "Poland", code: "+48" }, { name: "Portugal", code: "+351" },
    { name: "Qatar", code: "+974" }, { name: "Russia", code: "+7" },
    { name: "Saudi Arabia", code: "+966" }, { name: "Singapore", code: "+65" },
    { name: "South Africa", code: "+27" }, { name: "South Korea", code: "+82" },
    { name: "Spain", code: "+34" }, { name: "Sri Lanka", code: "+94" },
    { name: "Sweden", code: "+46" }, { name: "Switzerland", code: "+41" },
    { name: "Thailand", code: "+66" }, { name: "Turkey", code: "+90" },
    { name: "UAE", code: "+971" }, { name: "UK", code: "+44" },
    { name: "USA", code: "+1" }, { name: "Vietnam", code: "+84" }
].sort((a, b) => a.name.localeCompare(b.name));

const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");

if (countryCodeSelect) {
    countryCodeSelect.innerHTML = COUNTRY_CODES.map(c =>
        `<option value="${c.code}">${c.name} (${c.code})</option>`
    ).join("");

    // Default to India
    countryCodeSelect.value = "+91";
}

// Strip anything that isn't a digit as the user types, live.
phoneInput?.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    phoneError.innerText = "";
});

function validatePhone() {
    const digitsOnly = phoneInput.value.trim();

    if (!/^[0-9]{10}$/.test(digitsOnly)) {
        phoneError.innerText = "Enter a valid 10-digit mobile number (numbers only).";
        return false;
    }

    phoneError.innerText = "";
    return true;
}

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

// checkoutTotal is the grand total actually charged (items + handling + shipping - discount)
// It's mutable because a coupon can change it after the page first loads.
let discountAmount = 0;
let appliedCouponCode = null;
let checkoutTotal = itemsTotal + handlingFee + shippingFee;

function renderSummary() {
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
            ${discountAmount > 0 ? `
            <div class="breakdown-row">
                <span>Coupon (${appliedCouponCode})</span>
                <span class="free-tag">− ₹${discountAmount}</span>
            </div>
            ` : ""}
            <p class="gst-note">Inclusive of all taxes (GST included)</p>
            <div class="breakdown-row breakdown-total">
                <span>Grand Total</span>
                <span>₹${checkoutTotal}</span>
            </div>
        </div>
    `;
}

renderSummary();

// ---------- Coupon apply ----------
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponMessage = document.getElementById("couponMessage");

applyCouponBtn?.addEventListener("click", async () => {
    const code = couponInput.value.trim().toUpperCase();

    if (!code) {
        couponMessage.innerText = "Enter a coupon code.";
        couponMessage.className = "coupon-message error";
        return;
    }

    try {
        applyCouponBtn.disabled = true;
        applyCouponBtn.innerText = "Checking...";

        const preDiscountTotal = itemsTotal + handlingFee + shippingFee;

        const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, orderTotal: preDiscountTotal })
        });
        const data = await res.json();

        if (!data.success) {
            couponMessage.innerText = data.message || "Invalid coupon.";
            couponMessage.className = "coupon-message error";
            discountAmount = 0;
            appliedCouponCode = null;
            checkoutTotal = preDiscountTotal;
            renderSummary();
            return;
        }

        discountAmount = data.coupon.discountAmount;
        appliedCouponCode = data.coupon.code;
        checkoutTotal = preDiscountTotal - discountAmount;

        couponMessage.innerText = `Coupon applied! You saved ₹${discountAmount}.`;
        couponMessage.className = "coupon-message success";

        renderSummary();
    } catch (error) {
        console.error(error);
        couponMessage.innerText = "Unable to validate coupon right now.";
        couponMessage.className = "coupon-message error";
    } finally {
        applyCouponBtn.disabled = false;
        applyCouponBtn.innerText = "Apply";
    }
});

document
.getElementById("payButton")
.addEventListener("click", startPayment);

async function startPayment() {

    if (!validatePhone()) {
        phoneInput.focus();
        return;
    }

    const customer = {

        name: document.getElementById("name").value.trim(),

        phone: `${countryCodeSelect.value} ${phoneInput.value.trim()}`,

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

        couponCode: appliedCouponCode || null,

        discountAmount: discountAmount || 0,

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
console.log("Hostname:", window.location.hostname);
console.log("API_BASE_URL:", API_BASE_URL);

const order = JSON.parse(localStorage.getItem("currentOrder"));

if (!order) {
    alert("No product selected.");
    window.location.href = "index.html";
}

const summary = document.getElementById("orderSummary");

summary.innerHTML = `
    <img src="assets/images/products/${order.image}" width="120">
    <h3>${order.name}</h3>
    <h2>₹${order.price}</h2>
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
                amount: order.price
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

        description: order.name,

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

    const orderData = {

        customerName: customer.name,

        phone: customer.phone,

        email: customer.email,

        address: customer.address,

        product: order.name,

        quantity: 1,

        price: order.price,

        total: order.price,

        paymentId: payment.razorpay_payment_id,

        orderId: payment.razorpay_order_id,

        paymentStatus: "Paid",

        orderStatus: "Pending"

    };

    try {

        const response = await fetch(`${API_BASE_URL}/api/orders`,
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

            alert("✅ Payment Successful!\n\nYour order has been placed.");

            window.location.href = "index.html";

        }

        else {

            alert("Payment received but order could not be saved.");

        }

    }

    catch (err) {

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

            const postOffice = data[0].PostOffice[0];

            // Auto fill city
            cityInput.value = postOffice.District || '';

            // Auto fill area
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
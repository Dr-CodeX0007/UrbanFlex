const ordersContainer = document.getElementById("ordersContainer");

const totalOrders = document.getElementById("totalOrders");

const totalRevenue = document.getElementById("totalRevenue");

const pendingOrders = document.getElementById("pendingOrders");

const searchOrder = document.getElementById("searchOrder");

const modal = document.getElementById("orderModal");

const modalBody = document.getElementById("modalBody");

const closeModal = document.getElementById("closeModal");

const todayDate = document.getElementById("todayDate");

todayDate.innerText = new Date().toLocaleDateString();

let orders = [];

async function loadOrders() {

    try {

        console.log("Fetching orders from Render API...");

        const response = await fetch("https://urbanflex.onrender.com/api/orders", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Response status:", response.status);

        const data = await response.json();

        console.log("Orders received:", data);

        // Force assign all orders
        orders = Array.isArray(data) ? data : [];

        console.log("Total orders loaded:", orders.length);

        // Render ALL orders regardless of date
        renderDashboard();
        renderOrders(orders);

    } catch (error) {

        console.error("Admin load error:", error);

        ordersContainer.innerHTML = `
            <h2 style="color:red;">
                Unable to Load Orders.
            </h2>
        `;
    }
}
function renderDashboard(){

    totalOrders.innerText = orders.length;

    const revenue = orders.reduce((total, order) => {

        return total + Number(order.total);

    }, 0);

    totalRevenue.innerText = `₹${revenue}`;

    const pending = orders.filter(order =>

        order.orderStatus === "Pending"

    ).length;

    pendingOrders.innerText = pending;

}

function renderOrders(orderList){

    ordersContainer.innerHTML = "";

    if(orderList.length === 0){

        ordersContainer.innerHTML = "<h2>No Orders Found.</h2>";

        return;

    }

    orderList.forEach(order => {

        ordersContainer.innerHTML += `

        <div class="order-card">

            <div class="order-left">

                <h3>${order.customerName}</h3>

                <p><strong>Phone:</strong> ${order.phone}</p>

                <p><strong>Products:</strong>
    ${
        Array.isArray(order.items) && order.items.length > 0
            ? order.items.map(item =>
                `${item.name} × ${item.quantity}`
              ).join("<br>")
            : `${order.product} × ${order.quantity}`
    }
</p>

                <p><strong>Status:</strong> ${order.orderStatus}</p>

                <p><strong>Payment:</strong> ${order.paymentStatus}</p>

            </div>

            <div class="order-right">

                <div class="order-price">
    ₹${order.total}
</div>

<button
    class="view-btn"
    onclick="viewOrder(${order.id})">

    View Details

</button>

<div class="admin-actions">

    <button onclick="updateStatus(${order.id},'Confirmed')">
        Confirm
    </button>

    <button onclick="updateStatus(${order.id},'Shipped')">
        Ship
    </button>

    <button onclick="updateStatus(${order.id},'Delivered')">
        Deliver
    </button>

    <button onclick="deleteOrder(${order.id})">
        Delete
    </button>

</div>

        `;

    });

}
function viewOrder(id){

    const order = orders.find(item => item.id === id);

    if(!order) return;

    modalBody.innerHTML = `

        <h3>Customer Details</h3>

        <p><strong>Name:</strong> ${order.customerName}</p>

        <p><strong>Phone:</strong> ${order.phone}</p>

        <p><strong>Email:</strong> ${order.email}</p>

        <p><strong>Address:</strong> ${order.address}</p>

        <hr>

        <h3>Order Details</h3>

        <p>
    <strong>Products:</strong>
</p>

${
    Array.isArray(order.items) && order.items.length > 0
        ? `
            <div class="order-items">
                ${order.items.map(item => `
                    <div style="margin-bottom:10px;">
                        <strong>${item.name}</strong><br>
                        Quantity: ${item.quantity}<br>
                        Price: ₹${item.price}<br>
                        Item Total: ₹${item.total}
                    </div>
                `).join("")}
            </div>
        `
        : `
            <p>
                ${order.product}<br>
                Quantity: ${order.quantity}<br>
                Price: ₹${order.price}
            </p>
        `
}

<p><strong>Grand Total:</strong> ₹${order.total}</p>

        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>

        <p><strong>Order Status:</strong> ${order.orderStatus}</p>

        <p><strong>Order Date:</strong> ${order.orderDate}</p>

    `;

    modal.style.display = "flex";

}

closeModal.addEventListener("click",()=>{

    modal.style.display = "none";

});

window.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

});

searchOrder.addEventListener("input",()=>{

    const value = searchOrder.value.toLowerCase();

    const filtered = orders.filter(order => {

    const customerName =
        (order.customerName || "").toLowerCase();

    const phone =
        (order.phone || "").toLowerCase();

    const product =
        (order.product || "").toLowerCase();

    const itemNames =
        Array.isArray(order.items)
            ? order.items
                .map(item => (item.name || "").toLowerCase())
                .join(" ")
            : "";

    return (
        customerName.includes(value) ||
        phone.includes(value) ||
        product.includes(value) ||
        itemNames.includes(value)
    );

});

    renderOrders(filtered);

});const filtered = orders.filter(order=>
// UPDATE ORDER STATUS

async function updateStatus(id, status){

    try{

        const response = await fetch(`https://urbanflex.onrender.com/api/orders/${id}/status`,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                orderStatus:status

            })

        });

        const data = await response.json();

        if(data.success){

            alert("Order Updated Successfully");

            loadOrders();

        }

        else{

            alert(data.message);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to update order.");

    }

}



// DELETE ORDER

async function deleteOrder(id){

    const confirmDelete = confirm("Delete this order?");

    if(!confirmDelete) return;

    try{

        const response = await fetch(`https://urbanflex.onrender.com/api/orders/${id}`,{

            method:"DELETE"

        });

        const data = await response.json();

        if(data.success){

            alert("Order Deleted Successfully");

            loadOrders();

        }

        else{

            alert(data.message);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to delete order.");

    }

}

loadOrders();
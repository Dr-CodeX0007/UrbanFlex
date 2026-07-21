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

async function loadOrders(){

    try{

        const response = await fetch("http://localhost:5000/api/orders");

        orders = await response.json();

        renderDashboard();

        renderOrders(orders);

    }

    catch(error){

        console.error(error);

        ordersContainer.innerHTML="<h2>Unable to Load Orders.</h2>";

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

                <p><strong>Product:</strong> ${order.product}</p>

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

        <p><strong>Product:</strong> ${order.product}</p>

        <p><strong>Quantity:</strong> ${order.quantity}</p>

        <p><strong>Total:</strong> ₹${order.total}</p>

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

    const filtered = orders.filter(order=>

        order.customerName.toLowerCase().includes(value) ||

        order.phone.includes(value) ||

        order.product.toLowerCase().includes(value)

    );

    renderOrders(filtered);

});
// UPDATE ORDER STATUS

async function updateStatus(id, status){

    try{

        const response = await fetch(`http://localhost:5000/api/orders/${id}/status`,{

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

        const response = await fetch(`http://localhost:5000/api/orders/${id}`,{

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
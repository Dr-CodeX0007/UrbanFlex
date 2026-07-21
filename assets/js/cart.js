const cartItems = document.getElementById("cartItems");
const totalItems = document.getElementById("totalItems");
const grandTotal = document.getElementById("grandTotal");
const checkoutButton = document.getElementById("checkoutButton");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {

    const count = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }

}

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your Cart is Empty</h2>
                <br>
                <button class="buy-btn" onclick="location.href='index.html'">
                    Continue Shopping
                </button>
            </div>
        `;

        totalItems.textContent = "0";
        grandTotal.textContent = "₹0";

        checkoutButton.disabled = true;

        return;
    }

    checkoutButton.disabled = false;

    let totalQty = 0;
    let totalPrice = 0;

    cart.forEach(item => {

        totalQty += item.quantity;
        totalPrice += item.price * item.quantity;

        cartItems.innerHTML += `

        <div class="cart-card">

            <img
                src="assets/images/products/${item.image}"
                alt="${item.name}"
            >

            <div class="cart-info">

                <h3>${item.name}</h3>

                <p>₹${item.price}</p>

                <div class="qty-box">

                    <button onclick="decreaseQty(${item.id})">−</button>

                    <span>${item.quantity}</span>

                    <button onclick="increaseQty(${item.id})">+</button>

                </div>

                <button
                    class="remove-btn"
                    onclick="removeProduct(${item.id})">

                    Remove

                </button>

            </div>

        </div>

        `;

    });

    totalItems.textContent = totalQty;

    grandTotal.textContent = "₹" + totalPrice;

    saveCart();

    updateCartCount();

}

function increaseQty(id) {

    const item = cart.find(product => product.id === id);

    item.quantity++;

    renderCart();

}

function decreaseQty(id) {

    const item = cart.find(product => product.id === id);

    if (item.quantity > 1) {

        item.quantity--;

    } else {

        removeProduct(id);

        return;

    }

    renderCart();

}

function removeProduct(id) {

    cart = cart.filter(item => item.id !== id);

    renderCart();

}

checkoutButton.addEventListener("click", () => {

    localStorage.removeItem("buyNowProduct");

    localStorage.setItem("checkoutCart", JSON.stringify(cart));

    window.location.href = "checkout.html";

});

renderCart();
const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");

let allProducts = [];

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {
        productContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    productList.forEach(product => {

        const mainImage = (product.images && product.images[0]) || "assets/images/logo.png";

        productContainer.innerHTML += `

        <div class="product-card">

            <img
                src="${mainImage}"
                alt="${product.name}"
            >

            <div class="rating">

                ⭐ ${product.rating} (${product.reviews} Reviews)

            </div>

            <div class="product-name">

                ${product.name}

            </div>

                        <div class="price">

                ₹${product.price}
                ${product.discountPercent > 0 ? `<span class="mrp-strike">₹${product.mrp}</span>` : ""}

            </div>

            ${product.discountPercent > 0 ? `<span class="discount-tag">${product.discountPercent}% off</span>` : ""}

            <p class="return-policy">7 Days Return</p>
            <p class="delivery-estimate">Delivered in ${product.deliveryDays || 5} days</p>

            <button
                class="buy-btn"
                onclick="location.href='product.html?slug=${product.slug}'">

                Buy Now

            </button>

        </div>

        `;

    });

}

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error("Unable to load products:", error);
        productContainer.innerHTML = "<p>Unable to load products right now. Please try again later.</p>";
    }
}

loadProducts();

searchInput.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const filteredProducts = allProducts.filter(product =>

        product.name.toLowerCase().includes(keyword)

    );

    displayProducts(filteredProducts);

});

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const count = cart.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
    );

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }
}

// Update when homepage loads
updateCartCount();

// Important: update again when browser restores the page
// from back/forward cache after returning from product/cart pages.
window.addEventListener("pageshow", updateCartCount);

// Also update when localStorage changes from another tab/window.
window.addEventListener("storage", updateCartCount);
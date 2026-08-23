const params = new URLSearchParams(window.location.search);
const productSlug = params.get("slug");

const productDetails = document.getElementById("productDetails");

let product = null;
let currentImageIndex = 0;
let productImages = [];

// Turns a number of days into an actual calendar date, e.g. "30 Aug".
function getDeliveryDateText(days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 5));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

async function loadProduct() {
    if (!productSlug) {
        productDetails.innerHTML = "<h2>Product Not Found</h2>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${productSlug}`);

        if (!res.ok) {
            productDetails.innerHTML = "<h2>Product Not Found</h2>";
            return;
        }

        product = await res.json();
        productImages = product.images && product.images.length > 0
            ? product.images
            : ["assets/images/logo.png"];

        renderProduct();
    } catch (error) {
        console.error(error);
        productDetails.innerHTML = "<h2>Unable to load product right now.</h2>";
    }
}

// Builds the "About this item" bullet list.
// Uses admin-entered bullet points if available, otherwise
// breaks the description into readable sentence bullets.
function buildBulletList() {
    let points = product.bulletPoints && product.bulletPoints.length > 0
        ? product.bulletPoints
        : (product.description || "")
            .split(".")
            .map(s => s.trim())
            .filter(s => s.length > 0);

    if (points.length === 0) return "";

    return `
        <div class="about-item">
            <h3>About this item</h3>
            <ul class="bullet-points">
                ${points.map(point => `<li>${point}</li>`).join("")}
            </ul>
        </div>
    `;
}

function renderProduct() {

    productDetails.innerHTML = `

    <div class="product-page">

        <div class="product-left">

            <div class="image-slider">
                <div class="slider-main-wrap">
                    <button class="slider-arrow slider-prev" onclick="prevImage()">&#10094;</button>
                    <img src="${productImages[0]}" alt="${product.name}" id="mainProductImage" class="slider-main-img">
                    <button class="slider-arrow slider-next" onclick="nextImage()">&#10095;</button>
                </div>

                <div class="slider-dots" id="sliderDots"></div>

                ${productImages.length > 1 ? `
                <div class="thumbnail-row">
                    ${productImages.map((img, index) => `
                        <img
                            src="${img}"
                            class="thumbnail ${index === 0 ? "active" : ""}"
                            onclick="showImage(${index})"
                        >
                    `).join("")}
                </div>
                ` : ""}
            </div>

        </div>

        <div class="product-right">

            <h1>${product.name}</h1>
            ${product.isBestseller ? `<span class="bestseller-badge">Bestseller</span>` : ""}

            <div class="price-row">
                ${product.discountPercent > 0 ? `
                    <div class="discount-row">
                        <span class="discount-tag">🔥 ${product.discountPercent}% OFF</span>
                    </div>
                ` : ""}
                <div class="price-line">
                    ${product.discountPercent > 0 ? `<span class="mrp-strike">₹${product.mrp}</span>` : ""}
                    <span class="price">₹${product.price}</span>
                </div>
                ${product.discountPercent > 0 ? `
                    <span class="savings-text">You save ₹${product.mrp - product.price}</span>
                ` : ""}
            </div>

            <div class="return-badge">
                🔄 7 Days Return &amp; Replace — No Questions Asked
            </div>

            <p class="delivery-estimate">🚚 Delivery by ${getDeliveryDateText(product.deliveryDays)}</p>

            <div class="product-buttons">
                <button class="cart-btn" onclick="addToCart()">Add to Cart</button>
                <button class="buy-btn" onclick="goToCheckout()">Buy Now</button>
            </div>

            <div class="trust-icons">

                <div class="trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
                    <span>1 Year<br>Warranty</span>
                </div>

                <div class="trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
                    <span>7 Days<br>Returnable</span>
                </div>

                <div class="trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="7" width="15" height="10" rx="1"/><path d="M16 10h3l3 3v4h-6z"/><circle cx="6" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/></svg>
                    <span>Free<br>Delivery</span>
                </div>

                <div class="trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    <span>Secure<br>Transaction</span>
                </div>

                <div class="trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.4 5.5L20 8l-4.5 3.9L16.9 18 12 14.8 7.1 18l1.4-6.1L4 8l5.6-.5z"/></svg>
                    <span>UrbanFlex<br>Delivered</span>
                </div>

            </div>

            ${buildBulletList()}

        </div>

    </div>

    `;

    buildSliderDots();
}

function buildSliderDots() {
    const dotsContainer = document.getElementById("sliderDots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = productImages.map((_, index) => `
        <button class="slider-dot ${index === 0 ? "active" : ""}" onclick="showImage(${index})"></button>
    `).join("");
}

function showImage(index) {
    currentImageIndex = index;
    document.getElementById("mainProductImage").src = productImages[index];

    document.querySelectorAll(".thumbnail").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });

    document.querySelectorAll(".slider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === index);
    });
}

function nextImage() {
    const next = (currentImageIndex + 1) % productImages.length;
    showImage(next);
}

function prevImage() {
    const prev = (currentImageIndex - 1 + productImages.length) % productImages.length;
    showImage(prev);
}

// Basic swipe support for mobile
let touchStartX = 0;

document.addEventListener("touchstart", (e) => {
    if (e.target.closest(".slider-main-wrap")) {
        touchStartX = e.changedTouches[0].screenX;
    }
});

document.addEventListener("touchend", (e) => {
    if (!e.target.closest(".slider-main-wrap")) return;

    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > 40) {
        if (diff < 0) nextImage();
        else prevImage();
    }
});

loadProduct();

function addToCart(){

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: (product.images && product.images[0]) || "assets/images/logo.png",
        quantity: 1
    };

    const existing = cart.find(item => item.id === cartItem.id);

    if(existing){

        existing.quantity++;

    }

    else{

        cart.push(cartItem);

    }

    localStorage.setItem("cart",JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    alert("Product Added To Cart");history.back();

}

function goToCheckout(){

    localStorage.removeItem("checkoutCart");

    localStorage.setItem("currentOrder", JSON.stringify({
        id: product._id,
        name: product.name,
        price: product.price,
        image: (product.images && product.images[0]) || "assets/images/logo.png"
    }));

    window.location.href = "checkout.html";

}
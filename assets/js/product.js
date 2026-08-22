const params = new URLSearchParams(window.location.search);
const productSlug = params.get("slug");

const productDetails = document.getElementById("productDetails");

let product = null;

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
        renderProduct();
    } catch (error) {
        console.error(error);
        productDetails.innerHTML = "<h2>Unable to load product right now.</h2>";
    }
}

function renderProduct() {

    const images = product.images && product.images.length > 0
        ? product.images
        : ["assets/images/logo.png"];

    const bulletPoints = product.bulletPoints && product.bulletPoints.length > 0
        ? `<ul class="bullet-points">${product.bulletPoints.map(point => `<li>${point}</li>`).join("")}</ul>`
        : "";

    productDetails.innerHTML = `

    <div class="product-page">

        <div class="product-left">

            <img
                src="${images[0]}"
                alt="${product.name}"
                id="mainProductImage"
            >

            ${images.length > 1 ? `
            <div class="thumbnail-row">
                ${images.map((img, index) => `
                    <img
                        src="${img}"
                        class="thumbnail ${index === 0 ? "active" : ""}"
                        onclick="document.getElementById('mainProductImage').src='${img}';
                                 document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                                 this.classList.add('active');"
                    >
                `).join("")}
            </div>
            ` : ""}

        </div>

        <div class="product-right">

            <div class="rating">

                ⭐ ${product.rating} (${product.reviews} Reviews)
                ${product.isBestseller ? `<span class="bestseller-badge">Bestseller</span>` : ""}

            </div>

            <h1>${product.name}</h1>

            <h2>
                ₹${product.price}
                ${product.discountPercent > 0 ? `
                    <span class="mrp-strike">₹${product.mrp}</span>
                    <span class="discount-tag">${product.discountPercent}% off</span>
                ` : ""}
            </h2>

            <p class="return-policy">7 Days Return and Replace, No Questions Asked</p>

            <p class="delivery-estimate">Delivery in ${product.deliveryDays || 5} days</p>

            <div class="product-buttons">

                <button class="cart-btn" onclick="addToCart()">

                    Add to Cart

                </button>

                <button class="buy-btn" onclick="goToCheckout()">

                    Buy Now

                </button>

            </div>

            <p class="product-description">

                ${product.description}

            </p>

            ${bulletPoints}

        </div>

    </div>

    `;
}

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
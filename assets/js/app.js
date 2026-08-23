const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");
const categoriesRow = document.getElementById("categoriesRow");
const sortByBtn = document.getElementById("sortByBtn");
const sortByMenu = document.getElementById("sortByMenu");

let allProducts = [];
let allCategories = [];

let currentSearch = "";
let currentCategoryId = "all";
let currentSort = "";

// Picks a fitting emoji icon for a category based on its name.
function getCategoryIcon(name) {
    const n = name.toLowerCase();

    if (n.includes("trend")) return "🔥";
    if (n.includes("weight") || n.includes("dumbbell") || n.includes("plate")) return "🏋️";
    if (n.includes("machine")) return "⚙️";
    if (n.includes("outfit") || n.includes("wear") || n.includes("cloth") || n.includes("apparel")) return "👕";
    if (n.includes("boxing") || n.includes("combat")) return "🥊";
    if (n.includes("cardio") || n.includes("treadmill") || n.includes("bike")) return "🏃";
    if (n.includes("yoga")) return "🧘";
    if (n.includes("accessor")) return "🎒";

    return "🏷️";
}

// Turns a number of days into an actual calendar date, e.g. "30 Aug".
function getDeliveryDateText(days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 5));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {
        productContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    productList.forEach(product => {

        const mainImage = (product.images && product.images[0]) || "assets/images/logo.png";
        const deliveryDate = getDeliveryDateText(product.deliveryDays);
        const goToProduct = `location.href='product.html?slug=${product.slug}'`;

        productContainer.innerHTML += `

        <div class="product-card" onclick="${goToProduct}">

            <img
                src="${mainImage}"
                alt="${product.name}"
            >

            <div class="product-name">

                ${product.name}

            </div>

            <div class="card-price-row">
                <span class="price">₹${product.price}</span>
                ${product.discountPercent > 0 ? `
                    <span class="mrp-strike">₹${product.mrp}</span>
                    <span class="discount-tag">${product.discountPercent}% off</span>
                ` : ""}
            </div>

            <p class="return-policy">7 Days Return</p>
            <p class="delivery-estimate">Delivery by ${deliveryDate}</p>

            <div class="rating">
                ⭐ ${product.rating} (${product.reviews} Reviews)
            </div>

            <button
                class="buy-btn"
                onclick="event.stopPropagation(); ${goToProduct}">

                Buy Now

            </button>

        </div>

        `;

    });

}

// Applies the current search keyword, category filter, and sort
// mode together, then renders the result. Called whenever any of
// those three change.
function applyFiltersAndRender() {

    let result = [...allProducts];

    if (currentCategoryId !== "all") {
        result = result.filter(p => p.category && p.category._id === currentCategoryId);
    }

    if (currentSearch) {
        result = result.filter(p => p.name.toLowerCase().includes(currentSearch));
    }

    if (currentSort === "price_asc") {
        result.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price_desc") {
        result.sort((a, b) => b.price - a.price);
    } else if (currentSort === "latest") {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === "category") {
        result.sort((a, b) => {
            const nameA = a.category ? a.category.name : "";
            const nameB = b.category ? b.category.name : "";
            return nameA.localeCompare(nameB);
        });
    }

    displayProducts(result);
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        allProducts = await res.json();
        applyFiltersAndRender();
    } catch (error) {
        console.error("Unable to load products:", error);
        productContainer.innerHTML = "<p>Unable to load products right now. Please try again later.</p>";
    }
}

async function loadCategories() {
    if (!categoriesRow) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        allCategories = await res.json();
        renderCategoriesRow();
    } catch (error) {
        console.error("Unable to load categories:", error);
    }
}

function renderCategoriesRow() {

    const allChip = `
        <button class="category-chip active" data-id="all" onclick="selectCategory('all')">
            <span class="category-icon">🛍️</span>
            <span>All</span>
        </button>
    `;

    const chips = allCategories.map(cat => `
        <button class="category-chip" data-id="${cat._id}" onclick="selectCategory('${cat._id}')">
            <span class="category-icon">${getCategoryIcon(cat.name)}</span>
            <span>${cat.name}</span>
        </button>
    `).join("");

    categoriesRow.innerHTML = allChip + chips;
}

function selectCategory(categoryId) {
    currentCategoryId = categoryId;

    document.querySelectorAll(".category-chip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.id === categoryId);
    });

    applyFiltersAndRender();
}

loadProducts();
loadCategories();

searchInput.addEventListener("keyup", function () {
    currentSearch = this.value.toLowerCase();
    applyFiltersAndRender();
});

// ---------- Sort-by dropdown ----------
if (sortByBtn && sortByMenu) {

    sortByBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sortByMenu.classList.toggle("open");
    });

    sortByMenu.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            currentSort = btn.dataset.sort;

            sortByMenu.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            sortByMenu.classList.remove("open");
            applyFiltersAndRender();
        });
    });

    document.addEventListener("click", () => {
        sortByMenu.classList.remove("open");
    });
}

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
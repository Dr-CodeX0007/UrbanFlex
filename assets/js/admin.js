// ============================================================
// UrbanFlex Admin Panel — Login, Orders, Products, Categories
// ============================================================

const API = API_BASE_URL; // from config.js

// ---------- AUTH ----------
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

function getToken() {
    return localStorage.getItem("uf_admin_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

function showAdminPanel() {
    loginScreen.style.display = "none";
    adminPanel.style.display = "block";
    initAdminPanel();
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.innerText = "";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) {
            loginError.innerText = data.message || "Login failed.";
            return;
        }

        localStorage.setItem("uf_admin_token", data.token);
        showAdminPanel();
    } catch (error) {
        console.error(error);
        loginError.innerText = "Unable to reach server.";
    }
});

logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("uf_admin_token");
    location.reload();
});

// ---------- TABS ----------
function setupTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });
}

let adminInitDone = false;

function initAdminPanel() {
    if (adminInitDone) return;
    adminInitDone = true;

    setupTabs();
    todayDate.innerText = new Date().toLocaleDateString();

    loadOrders();
    loadCategories();
    loadProducts();
    loadCoupons();

    setupProductForm();
    setupCategoryForm();
    setupCouponForm();
}

// ============================================================
// ORDERS
// ============================================================
const ordersContainer = document.getElementById("ordersContainer");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const pendingOrders = document.getElementById("pendingOrders");
const searchOrder = document.getElementById("searchOrder");
const modal = document.getElementById("orderModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const todayDate = document.getElementById("todayDate");

let orders = [];

async function loadOrders() {
    try {
        const response = await fetch(`${API}/api/orders`);
        const data = await response.json();
        orders = Array.isArray(data) ? data : [];
        renderDashboard();
        renderOrders(orders);
    } catch (error) {
        console.error("Admin load error:", error);
        ordersContainer.innerHTML = `<h2 style="color:red;">Unable to Load Orders.</h2>`;
    }
}

function renderDashboard() {
    totalOrders.innerText = orders.length;

    const revenue = orders.reduce((total, order) => total + Number(order.total), 0);
    totalRevenue.innerText = `₹${revenue}`;

    const pending = orders.filter((order) => order.orderStatus === "Pending").length;
    pendingOrders.innerText = pending;
}

function renderOrders(orderList) {
    ordersContainer.innerHTML = "";

    if (orderList.length === 0) {
        ordersContainer.innerHTML = "<h2>No Orders Found.</h2>";
        return;
    }

    orderList.forEach((order) => {
        ordersContainer.innerHTML += `
        <div class="order-card">
            <div class="order-left">
                <h3>${order.customerName}</h3>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Products:</strong>
                    ${
                        Array.isArray(order.items) && order.items.length > 0
                            ? order.items.map((item) => `${item.name} × ${item.quantity}`).join("<br>")
                            : `${order.product} × ${order.quantity}`
                    }
                </p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.orderStatus.toLowerCase().replace(/\s+/g, "-")}">${order.orderStatus}</span></p>
                <p><strong>Payment:</strong> ${order.paymentStatus}</p>
            </div>
            <div class="order-right">
                <div class="order-price">₹${order.total}</div>
                <button class="view-btn" onclick="viewOrder(${order.id})">View Details</button>
                <div class="admin-actions">
                    <select class="status-select" onchange="updateStatus(${order.id}, this.value)">
                        <option value="">Update status...</option>
                        <option value="Confirmed" ${order.orderStatus === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Packed" ${order.orderStatus === "Packed" ? "selected" : ""}>Packed</option>
                        <option value="Dispatched" ${order.orderStatus === "Dispatched" ? "selected" : ""}>Dispatched</option>
                        <option value="Out for Delivery" ${order.orderStatus === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
                        <option value="Delivered" ${order.orderStatus === "Delivered" ? "selected" : ""}>Delivered</option>
                    </select>
                    <button class="delete-order-btn" onclick="deleteOrder(${order.id})">Delete</button>
                </div>
            </div>
        </div>
        `;
    });
}

function viewOrder(id) {
    const order = orders.find((item) => item.id === id);
    if (!order) return;

    modalBody.innerHTML = `
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <hr>
        <h3>Order Details</h3>
        <p><strong>Products:</strong></p>
        ${
            Array.isArray(order.items) && order.items.length > 0
                ? `<div class="order-items">
                    ${order.items.map((item) => `
                        <div style="margin-bottom:10px;">
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.quantity}<br>
                            Price: ₹${item.price}<br>
                            Item Total: ₹${item.total}
                        </div>
                    `).join("")}
                   </div>`
                : `<p>${order.product}<br>Quantity: ${order.quantity}<br>Price: ₹${order.price}</p>`
        }
        <p><strong>Grand Total:</strong> ₹${order.total}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        <p><strong>Order Status:</strong> ${order.orderStatus}</p>
        <p><strong>Order Date:</strong> ${order.orderDate}</p>
    `;

    modal.style.display = "flex";
}

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

searchOrder.addEventListener("input", () => {
    const value = searchOrder.value.toLowerCase();

    const filtered = orders.filter((order) => {
        const customerName = (order.customerName || "").toLowerCase();
        const phone = (order.phone || "").toLowerCase();
        const product = (order.product || "").toLowerCase();
        const itemNames = Array.isArray(order.items)
            ? order.items.map((item) => (item.name || "").toLowerCase()).join(" ")
            : "";

        return (
            customerName.includes(value) ||
            phone.includes(value) ||
            product.includes(value) ||
            itemNames.includes(value)
        );
    });

    renderOrders(filtered);
});

async function updateStatus(id, status) {
    if (!status) return;

    try {
        const response = await fetch(`${API}/api/orders/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderStatus: status })
        });
        const data = await response.json();

        if (data.success) {
            alert("Order Updated Successfully");
            loadOrders();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to update order.");
    }
}

async function deleteOrder(id) {
    const confirmDelete = confirm("Delete this order?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API}/api/orders/${id}`, { method: "DELETE" });
        const data = await response.json();

        if (data.success) {
            alert("Order Deleted Successfully");
            loadOrders();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to delete order.");
    }
}

// ============================================================
// CLOUDINARY UPLOAD HELPER
// ============================================================
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    });
    const data = await res.json();

    if (!data.secure_url) {
        throw new Error("Cloudinary upload failed.");
    }

    return data.secure_url;
}

// ============================================================
// CATEGORIES
// ============================================================
let categories = [];
let editingCategoryId = null;
let pendingCategoryImageFile = null;

const categoryForm = document.getElementById("categoryForm");
const categoriesContainer = document.getElementById("categoriesContainer");
const categoryImageInput = document.getElementById("categoryImage");
const categoryImagePreview = document.getElementById("categoryImagePreview");
const categoryCancelEdit = document.getElementById("categoryCancelEdit");
const categoryFormTitle = document.getElementById("categoryFormTitle");
const categorySubmitBtn = document.getElementById("categorySubmitBtn");

async function loadCategories() {
    try {
        const res = await fetch(`${API}/api/categories`);
        categories = await res.json();
        renderCategories();
        populateProductCategoryDropdown();
    } catch (error) {
        console.error(error);
    }
}

function renderCategories() {
    if (!categoriesContainer) return;

    if (categories.length === 0) {
        categoriesContainer.innerHTML = "<p>No categories yet.</p>";
        return;
    }

    categoriesContainer.innerHTML = categories.map((cat) => `
        <div class="admin-card">
            <img src="${cat.image || 'assets/images/logo.png'}" alt="${cat.name}">
            <h4>${cat.name}</h4>
            <div class="admin-card-actions">
                <button class="edit-btn" onclick="editCategory('${cat._id}')">Edit</button>
                <button class="delete-btn" onclick="removeCategory('${cat._id}')">Delete</button>
            </div>
        </div>
    `).join("");
}

function populateProductCategoryDropdown() {
    const select = document.getElementById("productCategory");
    if (!select) return;

    select.innerHTML = categories.map((cat) => `<option value="${cat._id}">${cat.name}</option>`).join("");
}

// ---------- Apparel (Upper/Bottom) size fields ----------
const SIZES_UPPER = ["S", "M", "L", "XL", "XXL"];
const SIZES_BOTTOM = ["26", "28", "32", "34", "36", "38", "40"];

function isApparelCategory(categoryId) {
    const cat = categories.find((c) => c._id === categoryId);
    if (!cat) return false;

    const n = cat.name.toLowerCase();
    return n.includes("outfit") || n.includes("wear") || n.includes("cloth") || n.includes("apparel");
}

function renderSizeCheckboxes(type, checkedSizes = []) {
    const row = document.getElementById("sizeCheckboxRow");
    const sizes = type === "Upper" ? SIZES_UPPER : type === "Bottom" ? SIZES_BOTTOM : [];

    row.innerHTML = sizes.map((size) => `
        <label class="size-checkbox-label">
            <input type="checkbox" value="${size}" ${checkedSizes.includes(size) ? "checked" : ""}>
            ${size}
        </label>
    `).join("");
}

function checkApparelSection() {
    const categoryId = document.getElementById("productCategory").value;
    const apparelSection = document.getElementById("apparelSection");

    if (isApparelCategory(categoryId)) {
        apparelSection.style.display = "block";
    } else {
        apparelSection.style.display = "none";
        document.getElementById("productApparelType").value = "";
        document.getElementById("sizeCheckboxRow").innerHTML = "";
    }
}

function setupApparelFields() {
    document.getElementById("productCategory")?.addEventListener("change", checkApparelSection);

    document.getElementById("productApparelType")?.addEventListener("change", (e) => {
        renderSizeCheckboxes(e.target.value);
    });
}

setupApparelFields();

categoryImageInput?.addEventListener("change", () => {
    const file = categoryImageInput.files[0];
    if (!file) return;
    pendingCategoryImageFile = file;
    categoryImagePreview.innerHTML = `<img src="${URL.createObjectURL(file)}">`;
});

function setupCategoryForm() {
    categoryForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("categoryName").value.trim();
        if (!name) return;

        try {
            let imageUrl;
            if (pendingCategoryImageFile) {
                categorySubmitBtn.disabled = true;
                categorySubmitBtn.innerText = "Uploading...";
                imageUrl = await uploadToCloudinary(pendingCategoryImageFile);
            }

            const payload = { name };
            if (imageUrl) payload.image = imageUrl;

            const url = editingCategoryId
                ? `${API}/api/categories/${editingCategoryId}`
                : `${API}/api/categories`;
            const method = editingCategoryId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Something went wrong.");
                return;
            }

            resetCategoryForm();
            loadCategories();
        } catch (error) {
            console.error(error);
            alert("Unable to save category.");
        } finally {
            categorySubmitBtn.disabled = false;
            categorySubmitBtn.innerText = editingCategoryId ? "Update Category" : "Add Category";
        }
    });

    categoryCancelEdit.addEventListener("click", resetCategoryForm);
}

function resetCategoryForm() {
    editingCategoryId = null;
    pendingCategoryImageFile = null;
    categoryForm.reset();
    categoryImagePreview.innerHTML = "";
    categoryFormTitle.innerText = "Add Category";
    categorySubmitBtn.innerText = "Add Category";
    categoryCancelEdit.style.display = "none";
}

function editCategory(id) {
    const cat = categories.find((c) => c._id === id);
    if (!cat) return;

    editingCategoryId = id;
    document.getElementById("categoryName").value = cat.name;
    categoryImagePreview.innerHTML = cat.image ? `<img src="${cat.image}">` : "";
    categoryFormTitle.innerText = "Edit Category";
    categorySubmitBtn.innerText = "Update Category";
    categoryCancelEdit.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeCategory(id) {
    if (!confirm("Delete this category? Products in it will remain but lose their category link.")) return;

    try {
        const res = await fetch(`${API}/api/categories/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        const data = await res.json();

        if (data.success) {
            loadCategories();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to delete category.");
    }
}

// ============================================================
// PRODUCTS
// ============================================================
let products = [];
let editingProductId = null;
let pendingProductImageFiles = [];

const productForm = document.getElementById("productForm");
const productsContainer = document.getElementById("productsContainer");
const productImagesInput = document.getElementById("productImages");
const productImagePreview = document.getElementById("productImagePreview");
const productCancelEdit = document.getElementById("productCancelEdit");
const productFormTitle = document.getElementById("productFormTitle");
const productSubmitBtn = document.getElementById("productSubmitBtn");
const searchProduct = document.getElementById("searchProduct");

async function loadProducts() {
    try {
        const res = await fetch(`${API}/api/products`);
        products = await res.json();
        renderProducts(products);
    } catch (error) {
        console.error(error);
    }
}

function renderProducts(list) {
    if (!productsContainer) return;

    if (list.length === 0) {
        productsContainer.innerHTML = "<p>No products yet.</p>";
        return;
    }

    productsContainer.innerHTML = list.map((p) => `
        <div class="admin-card">
            <img src="${(p.images && p.images[0]) || 'assets/images/logo.png'}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>MRP ₹${p.mrp} • ${p.discountPercent || 0}% off → ₹${p.price}</p>
            <p>${p.category ? p.category.name : "No category"}${p.isBestseller ? " • Bestseller" : ""}</p>
            <div class="admin-card-actions">
                <button class="edit-btn" onclick="editProduct('${p._id}')">Edit</button>
                <button class="delete-btn" onclick="removeProduct('${p._id}')">Delete</button>
            </div>
        </div>
    `).join("");
}

searchProduct?.addEventListener("input", () => {
    const value = searchProduct.value.toLowerCase();
    renderProducts(products.filter((p) => p.name.toLowerCase().includes(value)));
});

productImagesInput?.addEventListener("change", () => {
    pendingProductImageFiles = Array.from(productImagesInput.files);
    productImagePreview.innerHTML = pendingProductImageFiles
        .map((file) => `<img src="${URL.createObjectURL(file)}">`)
        .join("");
});

// ---------- Live final-price preview (MRP - discount%) ----------
const productMrpInput = document.getElementById("productMrp");
const productDiscountInput = document.getElementById("productDiscount");
const pricePreview = document.getElementById("pricePreview");

function updatePricePreview() {
    const mrp = Number(productMrpInput.value) || 0;
    const discount = Number(productDiscountInput.value) || 0;
    const finalPrice = Math.round(mrp - (mrp * discount) / 100);

    if (discount > 0 && mrp > 0) {
        pricePreview.innerText = `Final price: ₹${finalPrice} (₹${mrp} − ${discount}%)`;
    } else {
        pricePreview.innerText = `Final price: ₹${finalPrice}`;
    }
}

productMrpInput?.addEventListener("input", updatePricePreview);
productDiscountInput?.addEventListener("input", updatePricePreview);

function setupProductForm() {
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("productCategory").value;
        const mrp = Number(document.getElementById("productMrp").value);
        const discountPercent = Number(document.getElementById("productDiscount").value) || 0;
        const deliveryDays = Number(document.getElementById("productDeliveryDays").value) || 5;
        const description = document.getElementById("productDescription").value.trim();
        const bulletPoints = document.getElementById("productBullets").value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const isBestseller = document.getElementById("productBestseller").checked;

        if (!name || !category || !mrp) {
            alert("Name, category and MRP are required.");
            return;
        }

        try {
            productSubmitBtn.disabled = true;

            let imageUrls;
            if (pendingProductImageFiles.length > 0) {
                productSubmitBtn.innerText = "Uploading images...";
                imageUrls = await Promise.all(pendingProductImageFiles.map(uploadToCloudinary));
            }

            const apparelType = document.getElementById("productApparelType").value;
            const availableSizes = Array.from(
                document.querySelectorAll("#sizeCheckboxRow input:checked")
            ).map((cb) => cb.value);

            const payload = {
                name,
                category,
                mrp,
                discountPercent,
                deliveryDays,
                description,
                bulletPoints,
                isBestseller,
                apparelType,
                availableSizes
            };
                        payload.apparelType = document.getElementById("productApparelType").value;
            payload.availableSizes = Array.from(document.querySelectorAll("#sizeCheckboxRow input:checked")).map(cb => cb.value);

            if (imageUrls) payload.images = imageUrls;
            if (imageUrls) payload.images = imageUrls;

            const url = editingProductId
                ? `${API}/api/products/${editingProductId}`
                : `${API}/api/products`;
            const method = editingProductId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Something went wrong.");
                return;
            }

            resetProductForm();
            loadProducts();
        } catch (error) {
            console.error(error);
            alert("Unable to save product.");
        } finally {
            productSubmitBtn.disabled = false;
            productSubmitBtn.innerText = editingProductId ? "Update Product" : "Add Product";
        }
    });

    productCancelEdit.addEventListener("click", resetProductForm);
}

function resetProductForm() {
    editingProductId = null;
    pendingProductImageFiles = [];
    productForm.reset();
    productImagePreview.innerHTML = "";
    productFormTitle.innerText = "Add Product";
    productSubmitBtn.innerText = "Add Product";
    productCancelEdit.style.display = "none";
    updatePricePreview();
    document.getElementById("apparelSection").style.display = "none";
    document.getElementById("sizeCheckboxRow").innerHTML = "";
}

function editProduct(id) {
    const p = products.find((prod) => prod._id === id);
    if (!p) return;

    editingProductId = id;
    document.getElementById("productName").value = p.name;
    document.getElementById("productCategory").value = p.category ? p.category._id : "";
    document.getElementById("productMrp").value = p.mrp;
    document.getElementById("productDiscount").value = p.discountPercent || 0;
    document.getElementById("productDeliveryDays").value = p.deliveryDays || 5;
    document.getElementById("productDescription").value = p.description || "";
    document.getElementById("productBullets").value = (p.bulletPoints || []).join("\n");
    document.getElementById("productBestseller").checked = !!p.isBestseller;

        document.getElementById("productBestseller").checked = !!p.isBestseller;

    checkApparelSection();
    document.getElementById("productApparelType").value = p.apparelType || "";
    renderSizeCheckboxes(p.apparelType || "", p.availableSizes || []);

    productImagePreview.innerHTML = (p.images || []).map((img) => `<img src="${img}">`).join("");

    checkApparelSection();
    document.getElementById("productApparelType").value = p.apparelType || "";
    renderSizeCheckboxes(p.apparelType || "", p.availableSizes || []);

    productFormTitle.innerText = "Edit Product";
    productSubmitBtn.innerText = "Update Product";
    productCancelEdit.style.display = "inline-block";
    updatePricePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeProduct(id) {
    if (!confirm("Delete this product?")) return;

    try {
        const res = await fetch(`${API}/api/products/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        const data = await res.json();

        if (data.success) {
            loadProducts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to delete product.");
    }
}



// ============================================================
// COUPONS
// ============================================================
let coupons = [];

const couponForm = document.getElementById("couponForm");
const couponsContainer = document.getElementById("couponsContainer");
const couponSubmitBtn = document.getElementById("couponSubmitBtn");

async function loadCoupons() {
    if (!couponsContainer) return;

    try {
        const res = await fetch(`${API}/api/coupons`, { headers: authHeaders() });
        coupons = await res.json();
        renderCoupons();
    } catch (error) {
        console.error(error);
    }
}

function renderCoupons() {
    if (coupons.length === 0) {
        couponsContainer.innerHTML = "<p>No coupons yet.</p>";
        return;
    }

    couponsContainer.innerHTML = coupons.map((c) => `
        <div class="admin-card">
            <h4>${c.code}</h4>
            <p>${c.discountType === "percent" ? c.discountValue + "% off" : "₹" + c.discountValue + " off"}
               ${c.minOrderValue > 0 ? ` (min order ₹${c.minOrderValue})` : ""}</p>
            <p>${c.expiryDate ? "Expires: " + new Date(c.expiryDate).toLocaleDateString() : "No expiry"}
               • ${c.isActive ? "Active" : "Inactive"}</p>
            <div class="admin-card-actions">
                <button class="delete-btn" onclick="removeCoupon('${c._id}')">Delete</button>
            </div>
        </div>
    `).join("");
}

function setupCouponForm() {
    if (!couponForm) return;

    couponForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const code = document.getElementById("couponCode").value.trim().toUpperCase();
        const discountType = document.getElementById("couponDiscountType").value;
        const discountValue = Number(document.getElementById("couponDiscountValue").value);
        const minOrderValue = Number(document.getElementById("couponMinOrder").value) || 0;
        const expiryDate = document.getElementById("couponExpiry").value || null;
        const isActive = document.getElementById("couponActive").checked;

        if (!code || !discountValue) {
            alert("Coupon code and discount value are required.");
            return;
        }

        try {
            couponSubmitBtn.disabled = true;

            const res = await fetch(`${API}/api/coupons`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ code, discountType, discountValue, minOrderValue, expiryDate, isActive })
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Something went wrong.");
                return;
            }

            couponForm.reset();
            document.getElementById("couponActive").checked = true;
            loadCoupons();
        } catch (error) {
            console.error(error);
            alert("Unable to save coupon.");
        } finally {
            couponSubmitBtn.disabled = false;
        }
    });
}

async function removeCoupon(id) {
    if (!confirm("Delete this coupon?")) return;

    try {
        const res = await fetch(`${API}/api/coupons/${id}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        const data = await res.json();

        if (data.success) {
            loadCoupons();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to delete coupon.");
    }
}

// ---------- AUTO-LOGIN (if a saved token exists) ----------
// This runs at the very end of the file, after every const above it
// has already been declared, so initAdminPanel() can safely use them.
if (getToken()) {
    showAdminPanel();
}

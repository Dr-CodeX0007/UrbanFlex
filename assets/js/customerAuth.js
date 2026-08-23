// ============================================================
// Shared customer auth helpers - used by login.html, signup.html,
// account.html, and the main navbar (index.html, product.html etc.)
// ============================================================

function getCustomerToken() {
    return localStorage.getItem("uf_customer_token");
}

function saveCustomerSession(token, customer) {
    localStorage.setItem("uf_customer_token", token);
    localStorage.setItem("uf_customer_data", JSON.stringify(customer));
}

function getCustomerData() {
    const data = localStorage.getItem("uf_customer_data");
    return data ? JSON.parse(data) : null;
}

function logoutCustomer() {
    localStorage.removeItem("uf_customer_token");
    localStorage.removeItem("uf_customer_data");
    window.location.href = "index.html";
}

function customerAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCustomerToken()}`
    };
}

// Updates the navbar's Login/Account button based on whether a
// customer is currently logged in. Call this on every page that
// includes the standard navbar (needs an element with id="navAuthBtn").
function renderNavAuthButton() {
    const navAuthBtn = document.getElementById("navAuthBtn");
    if (!navAuthBtn) return;

    const customer = getCustomerData();

    if (customer) {
        navAuthBtn.innerHTML = `👤 ${customer.name.split(" ")[0]}`;
        navAuthBtn.onclick = () => { window.location.href = "account.html"; };
    } else {
        navAuthBtn.innerHTML = `👤 Login`;
        navAuthBtn.onclick = () => { window.location.href = "login.html"; };
    }
}

document.addEventListener("DOMContentLoaded", renderNavAuthButton);
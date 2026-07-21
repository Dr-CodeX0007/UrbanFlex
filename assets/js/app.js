const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");

function displayProducts(productList) {

    productContainer.innerHTML = "";

    productList.forEach(product => {

        productContainer.innerHTML += `

        <div class="product-card">

            <img
                src="assets/images/products/${product.image}"
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

            </div>

            <button
                class="buy-btn"
                onclick="location.href='product.html?id=${product.id}'">

                Buy Now

            </button>

        </div>

        `;

    });

}

displayProducts(products);



searchInput.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const filteredProducts = products.filter(product =>

        product.name.toLowerCase().includes(keyword)

    );

    displayProducts(filteredProducts);

});
function updateCartCount(){

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const count = cart.reduce((total,item)=>total+item.quantity,0);

    document.getElementById("cartCount").textContent = count;

}

updateCartCount();
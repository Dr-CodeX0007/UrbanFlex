const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

const product = products.find(item => item.id === productId);

const productDetails = document.getElementById("productDetails");

if (product) {

    productDetails.innerHTML = `

    <div class="product-page">

        <div class="product-left">

            <img
                src="assets/images/products/${product.image}"
                alt="${product.name}"
            >

        </div>

        <div class="product-right">

            <div class="rating">

                ⭐ ${product.rating} (${product.reviews} Reviews)

            </div>

            <h1>${product.name}</h1>

            <h2>₹${product.price}</h2>

            <p>

                ${product.description}

            </p>

            <div class="product-buttons">

                <button class="cart-btn" onclick="addToCart()">

                    Add to Cart

                </button>

                <button class="buy-btn" onclick="goToCheckout()">

                    Buy Now

                </button>

            </div>

        </div>

    </div>

    `;

} 

else{

    productDetails.innerHTML="<h2>Product Not Found</h2>";

}

function addToCart(){

    let cart=JSON.parse(localStorage.getItem("cart")) || [];

    const existing=cart.find(item=>item.id===product.id);

    if(existing){

        existing.quantity++;

    }

    else{

        cart.push({

            ...product,

            quantity:1

        });

    }

    localStorage.setItem("cart",JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    alert("Product Added To Cart");history.back();

}

function goToCheckout(){

    localStorage.removeItem("checkoutCart");

    localStorage.setItem("currentOrder", JSON.stringify(product));

    window.location.href = "checkout.html";

}
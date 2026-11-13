
// DUKA KENYA SHOPPING SYSTEM

let cart = JSON.parse(localStorage.getItem("dukaCart") || "[]");

// SAVE CART
function saveCart() {
    localStorage.setItem("dukaCart", JSON.stringify(cart));
    updateCartCount();
}

// UPDATE CART COUNTER
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
}

// ADD PRODUCT TO CART
function addToCart(name, price) {

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();

    alert(name + " added to your shopping cart!");
}

// REMOVE PRODUCT
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    showCart();
}

// CHANGE QUANTITY
function changeQuantity(name, amount) {
    const item = cart.find(product => product.name === name);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(name);
        return;
    }

    saveCart();
    showCart();
}

// FORMAT KENYAN CURRENCY
function formatPrice(price) {
    return "KSh " + price.toLocaleString("en-KE");
}

// DISPLAY SHOPPING CART
function showCart() {

    let total = 0;

    const items = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        return `
            <div style="padding:15px;border-bottom:1px solid #ddd">
                <strong>${item.name}</strong>
                <p>${formatPrice(item.price)}</p>

                <button onclick="changeQuantity('${item.name}',-1)">−</button>

                ${item.quantity}

                <button onclick="changeQuantity('${item.name}',1)">+</button>

                <button onclick="removeFromCart('${item.name}')">
                    Remove
                </button>
            </div>
        `;
    }).join("");

    let modal = document.getElementById("cartModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "cartModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:#0009;
            z-index:9999;
            display:flex;
            justify-content:center;
            align-items:center;
            padding:15px;
        `;

        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="
            background:white;
            padding:25px;
            border-radius:12px;
            width:100%;
            max-width:450px;
            max-height:85vh;
            overflow:auto;
        ">
            <h2>🛒 Your Shopping Cart</h2>

            ${items || "<p>Your cart is empty.</p>"}

            <h3 style="margin-top:20px">
                Total: ${formatPrice(total)}
            </h3>

            <button onclick="checkout()" style="
                background:#f68b1e;
                color:white;
                padding:12px;
                border:0;
                margin-top:15px;
                width:100%;
                cursor:pointer;
            ">
                PROCEED TO CHECKOUT
            </button>

            <button onclick="closeCart()" style="
                padding:12px;
                margin-top:10px;
                width:100%;
                cursor:pointer;
            ">
                Continue Shopping
            </button>
        </div>
    `;
}

// CLOSE CART
function closeCart() {
    const modal = document.getElementById("cartModal");

    if (modal) modal.remove();
}

// SEARCH PRODUCTS
function searchProducts() {

    const input = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const products = document.querySelectorAll(".product");

    products.forEach(product => {

        const name = product.querySelector("h3")
            .textContent.toLowerCase();

        product.style.display = name.includes(input)
            ? "block"
            : "none";
    });

    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}

// SEARCH WHEN ENTER IS PRESSED
document.getElementById("searchInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchProducts();
    }
});

// LOGIN PLACEHOLDER
function showLogin() {
    alert("Customer registration and login will be added in a later development step.");
}

// CHECKOUT PLACEHOLDER
function checkout() {
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    alert("Checkout system is coming in the next development stage.");
}

// INITIALIZE SHOPPING SYSTEM
updateCartCount();
// DUKA KENYA - SUPABASE CONNECTION

const SUPABASE_URL = "https://lqfofogdythejkguhjaz.supabase.co";

const SUPABASE_KEY = ";sb_publishable_S5HLkybpENjYJJ6100yD7Q_myBMpasa

async function initializeSupabase() {
    const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );

    window.dukaSupabase = createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    console.log("DUKA KENYA connected to Supabase!");
}

initializeSupabase();
// DUKA KENYA ACCOUNT SYSTEM

window.accountMode = "login";

window.showLogin = function () {
    window.accountMode = "login";

    document.getElementById("accountPopup").style.display = "flex";
    document.getElementById("accountTitle").textContent = "LOGIN";
    document.getElementById("accountSubmit").textContent = "LOGIN";
    document.getElementById("accountName").style.display = "none";
    document.getElementById("accountMessage").textContent = "";
};

window.showSignup = function () {
    window.accountMode = "signup";

    document.getElementById("accountPopup").style.display = "flex";
    document.getElementById("accountTitle").textContent = "CREATE ACCOUNT";
    document.getElementById("accountSubmit").textContent = "SIGN UP";
    document.getElementById("accountName").style.display = "block";
    document.getElementById("accountMessage").textContent = "";
};

window.closeAccount = function () {
    document.getElementById("accountPopup").style.display = "none";
};

window.submitAccount = async function () {
    const message = document.getElementById("accountMessage");
    const email = document.getElementById("accountEmail").value.trim();
    const password = document.getElementById("accountPassword").value;
    const name = document.getElementById("accountName").value.trim();

    if (!window.dukaSupabase) {
        message.textContent = "Please wait. Connecting...";
        return;
    }

    if (!email || !password) {
        message.textContent = "Enter your email and password.";
        return;
    }

    if (window.accountMode === "signup" && !name) {
        message.textContent = "Enter your full name.";
        return;
    }

    message.textContent = "Please wait...";

    try {
        if (window.accountMode === "signup") {
            const { data, error } = await window.dukaSupabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            message.textContent = "Account created! Check your email to confirm registration.";
        } else {
            const { data, error } = await window.dukaSupabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            message.textContent = "Login successful! Welcome to DUKA KENYA.";
        }
    } catch (error) {
        message.textContent = error.message;
    }
};

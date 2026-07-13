let nav = document.createElement("div");
document.body.appendChild(nav);
nav.className = "p-4 max-w-5xl mx-auto mt-4 bg-white border border-gray-200 shadow-sm rounded-lg flex gap-4 items-center";

let home = document.createElement("button");
home.innerText = "Home";
home.id = "homeBtn";
home.className = "border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 transition font-medium cursor-pointer";
nav.appendChild(home);

let wishlistViewBtn = document.createElement("button");
wishlistViewBtn.innerText = "Wishlist";
wishlistViewBtn.id = "wishBtn";
wishlistViewBtn.className = "border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 transition font-medium cursor-pointer";
nav.appendChild(wishlistViewBtn);

let cart = document.createElement("button");
cart.id = "cartBtn";
cart.className = "border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 transition font-medium cursor-pointer";
cart.innerHTML = "Cart (<span id=\"cartCount\">0</span>)";
nav.appendChild(cart);
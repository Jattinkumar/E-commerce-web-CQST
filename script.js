let unusedTempData = null; 

let container = document.createElement("div");
container.className = "p-4 max-w-5xl mx-auto";
document.body.appendChild(container);

let filterSection = document.createElement("div");
filterSection.className = "mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50 flex flex-col gap-4";
container.appendChild(filterSection);

let searchContainer = document.createElement("div");
searchContainer.className = "flex gap-2 max-w-md";
searchContainer.innerHTML = `
  <input type="text" id="findInput" class="border border-gray-400 p-2 rounded w-full bg-white" placeholder="Search products...">
  <button id="findBtn" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">Search</button>
`;
filterSection.appendChild(searchContainer);

let catDiv = document.createElement("div");
catDiv.className = "flex flex-wrap gap-2";
filterSection.appendChild(catDiv);

let productBox = document.createElement("div");
productBox.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6";
container.appendChild(productBox);

let cartBox = document.createElement("div");
cartBox.className = "p-5 border border-gray-200 shadow-md rounded-lg max-w-3xl mx-auto mt-6 bg-white";
cartBox.style.display = "none";
container.appendChild(cartBox);

let wishlistBox = document.createElement("div");
wishlistBox.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6";
wishlistBox.style.display = "none";
container.appendChild(wishlistBox);

let btnDiv = document.createElement("div");
btnDiv.className = "text-center my-6 flex justify-center items-center gap-2";
container.appendChild(btnDiv);

btnDiv.innerHTML = `
<button id="prevBtn" class="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100 transition disabled:opacity-40">Previous</button>
<span id="pageText" class="border border-gray-300 px-4 py-1.5 rounded bg-gray-50 font-medium">1</span>
<button id="nextBtn" class="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100 transition disabled:opacity-40">Next</button>
`;

let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let pageText = document.getElementById("pageText");

let homeBtn = document.getElementById("homeBtn");
let cartBtn = document.getElementById("cartBtn");
let cartCount = document.getElementById("cartCount");
let wishBtn = document.getElementById("wishBtn");

let page = 1;
let limit = 10;
let skip = 0;
let totalPages = 0;
let products = [];
let baseApiUrl = "https://dummyjson.com/products";
let selectedCategory = "";

let cartData = JSON.parse(localStorage.getItem("cartData")) || [];
let wishData = JSON.parse(localStorage.getItem("wishData")) || [];

function saveCart() {
    localStorage.setItem("cartData", JSON.stringify(cartData));
}

function saveWish() {
    localStorage.setItem("wishData", JSON.stringify(wishData));
}

function updateCartCount() {
    let total = 0;
    cartData.forEach(function(item) {
        total = total + item.count;
    });
    cartCount.innerText = total;
}

async function fetchCategories() {
    let response = await fetch("https://dummyjson.com/products/categories");
    let lists = await response.json();
    
    catDiv.innerHTML = "";
    
    let mainBtn = document.createElement("button");
    mainBtn.innerText = "All Products";
    mainBtn.className = "border border-gray-400 px-3 py-1 rounded-full text-xs " + (selectedCategory === "" ? "bg-blue-600 text-white" : "bg-white text-black");
    mainBtn.onclick = function() {
        selectedCategory = "";
        baseApiUrl = "https://dummyjson.com/products";
        page = 1;
        skip = 0;
        document.getElementById("findInput").value = "";
        fetchCategories();
        getData();
    };
    catDiv.appendChild(mainBtn);

    lists.forEach(function(c) {
        let name = c.name || c;
        let slug = c.slug || c;
        
        let targetBtn = document.createElement("button");
        targetBtn.innerText = name;
        targetBtn.className = "border border-gray-400 px-3 py-1 rounded-full text-xs " + (selectedCategory === slug ? "bg-blue-600 text-white" : "bg-white text-black");
        
        targetBtn.onclick = function() {
            selectedCategory = slug;
            baseApiUrl = `https://dummyjson.com/products/category/${slug}`;
            page = 1;
            skip = 0;
            document.getElementById("findInput").value = "";
            fetchCategories();
            getData();
        };
        catDiv.appendChild(targetBtn);
    });
}

async function getData() {
    let connector = baseApiUrl.includes("?") ? "&" : "?";
    let url = `${baseApiUrl}${connector}skip=${skip}&limit=${limit}`;

    let response = await fetch(url);
    let result = await response.json();

    products = result.products;
    totalPages = Math.ceil(result.total / limit);
    if (totalPages == 0) {
        totalPages = 1;
    }

    pageText.innerText = page + "/" + totalPages;

    showProducts();

    prevBtn.disabled = page == 1;
    nextBtn.disabled = page == totalPages;
}

document.getElementById("findBtn").addEventListener("click", function() {
    let searchVal = document.getElementById("findInput").value.trim();
    if (searchVal !== "") {
        selectedCategory = "";
        baseApiUrl = `https://dummyjson.com/products/search?q=${searchVal}`;
        page = 1;
        skip = 0;
        fetchCategories();
        getData();
    }
});

function wishlist(id) {
    let found = wishData.find(function(item) {
        return item.id == id;
    });
    return found ? true : false;
}

function showProducts() {
    productBox.innerHTML = "";
    
    if (products.length == 0) {
        productBox.innerHTML = `<p class="text-gray-500 col-span-4 text-center py-6">No products found matching criteria.</p>`;
        return;
    }

    products.forEach(function(product) {
        let heartClass = "text-gray-400 hover:text-red-500 transition-colors";

        if (wishlist(product.id)) {
            heartClass = "text-red-500 fill-red-500";
        }

        productBox.innerHTML += `
        <div class="border border-gray-200 shadow-sm p-4 rounded-xl bg-white flex flex-col justify-between relative">
            <div class="absolute top-2 right-2">
                <button onclick="wishNow(${product.id})" class="p-1 hover:bg-gray-100 rounded-full">
                    <i data-lucide="heart" class="${heartClass}"></i>
                </button>
            </div>

            <div>
                <h2 class="font-bold text-lg mb-1">${product.title}</h2>
                <p class="text-sm text-gray-600 mb-3">${product.description}</p>
            </div>

            <div>
                <h3 class="font-bold text-xl text-gray-900">$${product.price}</h3>
                <h3 class="bg-amber-100 border border-amber-300 text-amber-800 text-xs px-2 py-1 rounded inline-block my-2">
                    Stock: ${product.stock}
                </h3>

                <button onclick="buyNow(${product.id})" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-medium mt-2">
                    Buy Now
                </button>
            </div>
        </div>
        `;
    });

    lucide.createIcons();
}

function wishNow(id) {
    let product = products.find(function(item) { return item.id == id; }) || wishData.find(function(item) { return item.id == id; });

    let index = wishData.findIndex(function(item) {
        return item.id == id;
    });

    if (index == -1) {
        if (product) wishData.push(product);
    } else {
        wishData.splice(index, 1);
    }

    saveWish();
    showProducts();
    if (wishlistBox.style.display === "grid") {
        renderWishlistSection();
    }
}

function buyNow(id) {
    let product = products.find(function(item) {
        return item.id == id;
    }) || wishData.find(function(item) { return item.id == id; });

    let cartItem = cartData.find(function(item) {
        return item.id == id;
    });

    if (cartItem) {
        if (cartItem.count >= cartItem.stock) {
            alert("You can't cross the stock limit");
            return;
        }
        cartItem.count++;
    } else {
        cartData.push({
            id: product.id,
            title: product.title,
            price: product.price,
            stock: product.stock,
            count: 1
        });
    }

    saveCart();
    updateCartCount();
    showCart();
}

function getInvoiceTotal() {
    let combinedPrice = 0;
    cartData.forEach(function(element) {
        combinedPrice += (element.price * element.count);
    });
    return combinedPrice.toFixed(2);
}

function showCart() {
    cartBox.innerHTML = `<h2 class="font-bold text-xl border-b pb-2 mb-4">Cart Items</h2>`;

    if (cartData.length == 0) {
        cartBox.innerHTML += `<p class="text-gray-500 text-center py-4">No item in cart</p>`;
        return;
    }

    cartData.forEach(function(item) {
        cartBox.innerHTML += `
        <div class="border border-gray-200 bg-gray-50 p-4 mb-3 rounded-lg flex flex-col gap-2">
            <div>
                <h3 class="font-bold text-gray-800">${item.title}</h3>
                <p class="text-sm text-gray-600">Price: $${item.price} | Stock: ${item.stock}</p>
                <p class="text-sm font-semibold text-blue-600 mt-1">Count: ${item.count}</p>
            </div>

            <div class="flex gap-2 mt-2">
                <button onclick="minusCart(${item.id})" class="bg-gray-200 border border-gray-300 hover:bg-gray-300 px-3 py-1 rounded font-bold">-</button>
                <button onclick="plusCart(${item.id})" class="bg-gray-200 border border-gray-300 hover:bg-gray-300 px-3 py-1 rounded font-bold">+</button>
                <button onclick="removeCart(${item.id})" class="ml-auto bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium">
                    Remove
                </button>
            </div>
        </div>
        `;
    });

    let orderBillHTML = "";
    cartData.forEach(function(item) {
        let totalRowVal = (item.price * item.count).toFixed(2);
        orderBillHTML += `
          <tr class="border-b border-gray-200">
             <td class="p-2 text-left text-sm text-gray-700">${item.title}</td>
             <td class="p-2 text-center text-sm text-gray-600">$${item.price} x ${item.count}</td>
             <td class="p-2 text-right text-sm font-bold text-gray-800">$${totalRowVal}</td>
          </tr>
        `;
    });

    let finalBillAmount = getInvoiceTotal();

    cartBox.innerHTML += `
      <div class="mt-8 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
         <h3 class="text-lg font-bold text-gray-800 mb-2">Order Summary & Checkout</h3>
         
         <table class="w-full mb-4 border-collapse">
            <thead>
               <tr class="bg-gray-100 border-b border-gray-300">
                  <th class="p-2 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th class="p-2 text-center text-xs font-semibold text-gray-600">Qty Breakdown</th>
                  <th class="p-2 text-right text-xs font-semibold text-gray-600">Total</th>
               </tr>
            </thead>
            <tbody>
               ${orderBillHTML}
            </tbody>
         </table>

         <div class="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Billing Details</h4>
            <div class="flex flex-col gap-2">
               <input type="text" id="checkName" placeholder="Full Name" class="border p-1.5 rounded text-sm w-full bg-white border-gray-300">
               <input type="tel" id="checkPhone" placeholder="Phone Number" class="border p-1.5 rounded text-sm w-full bg-white border-gray-300">
            </div>
         </div>

         <div class="flex justify-between items-center py-2 font-bold text-lg text-gray-900 border-t border-dashed border-gray-300">
            <span>Grand Total:</span>
            <span class="text-blue-600">$${finalBillAmount}</span>
         </div>
         
         <button onclick="triggerPayment()" class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded font-bold mt-4 transition text-center">
            Place Order ($${finalBillAmount})
         </button>
      </div>
    `;
}

function triggerPayment() {
    let finalBillAmount = getInvoiceTotal();
    let clientName = document.getElementById("checkName") ? document.getElementById("checkName").value.trim() : "";
    
    if (parseFloat(finalBillAmount) <= 0) {
        alert("Your cart is completely empty!");
        return;
    }
    if(clientName === "") {
        alert("Please write your Name before proceeding to checkout.");
        return;
    }
    
    alert("Payment successful! Thank you for purchasing, " + clientName);
    
    cartData = [];
    saveCart();
    updateCartCount();
    showCart();
}

function renderWishlistSection() {
    wishlistBox.innerHTML = "";
    if (wishData.length == 0) {
        wishlistBox.innerHTML = `<p class="text-gray-500 text-center py-6 col-span-4 font-semibold">Your Wishlist is currently empty!</p>`;
        return;
    }

    wishData.forEach(function(product) {
        wishlistBox.innerHTML += `
        <div class="border border-gray-200 shadow-sm p-4 rounded-xl bg-white flex flex-col justify-between relative">
            <div class="absolute top-2 right-2">
                <button onclick="wishNow(${product.id})" class="p-1 hover:bg-gray-100 rounded-full">
                    <i data-lucide="heart" class="text-red-500 fill-red-500"></i>
                </button>
            </div>
            <div>
                <h2 class="font-bold text-lg mb-1">${product.title}</h2>
                <p class="text-sm text-gray-600 mb-3">${product.description}</p>
            </div>
            <div>
                <h3 class="font-bold text-xl text-gray-900">$${product.price}</h3>
                <button onclick="buyNow(${product.id})" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-medium mt-2">
                    Move to Cart
                </button>
            </div>
        </div>
        `;
    });
    lucide.createIcons();
}

function plusCart(id) {
    let item = cartData.find(function(product) {
        return product.id == id;
    });

    if (item.count >= item.stock) {
        alert("You can't cross the stock limit");
        return;
    }

    item.count++;
    saveCart();
    updateCartCount();
    showCart();
}

function minusCart(id) {
    let item = cartData.find(function(product) {
        return product.id == id;
    });

    item.count--;
    if (item.count == 0) {
        removeCart(id);
        return;
    }

    saveCart();
    updateCartCount();
    showCart();
}

function removeCart(id) {
    cartData = cartData.filter(function(item) {
        return item.id != id;
    });

    saveCart();
    updateCartCount();
    showCart();
}

nextBtn.addEventListener("click", function() {
    if (page == totalPages) {
        return;
    }
    page++;
    skip = skip + limit;
    getData();
});

prevBtn.addEventListener("click", function() {
    if (page == 1) {
        return;
    }
    page--;
    skip = skip - limit;
    getData();
});

cartBtn.addEventListener("click", function() {
    productBox.style.display = "none";
    btnDiv.style.display = "none";
    wishlistBox.style.display = "none";
    filterSection.style.display = "none"; 
    cartBox.style.display = "block";
    showCart();
});

homeBtn.addEventListener("click", function() {
    productBox.style.display = "grid";
    btnDiv.style.display = "flex";
    filterSection.style.display = "flex";
    cartBox.style.display = "none";
    wishlistBox.style.display = "none";
    showProducts();
});

wishBtn.addEventListener("click", function() {
    productBox.style.display = "none";
    btnDiv.style.display = "none";
    cartBox.style.display = "none";
    filterSection.style.display = "none";
    wishlistBox.style.display = "grid";
    renderWishlistSection();
});

updateCartCount();
fetchCategories();
getData();
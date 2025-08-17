
const container = document.getElementById("products-container");
const loadBtn = document.getElementById("load-btn");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("search-input");


const cartBtnHeader = document.getElementById("cart-btn");
const favBtnHeader = document.getElementById("fav-btn");     // header ka favourite button
const ordersBtnHeader = document.getElementById("orders-btn");


const cartCountEl = document.getElementById("cart-count");
const favCountEl = document.getElementById("fav-count");
const ordersCountEl = document.getElementById("orders-count");


const overlay = document.getElementById("popup-overlay");
const popupTitle = document.getElementById("popup-title");
const popupBody = document.getElementById("popup-body");
const popupClose = document.getElementById("popup-close");

let products = [];
let filtered = [];
let visibleCount = 6;
const step = 3;
const minVisible = 3;


let cart = loadLS("cart", []);
let favourites = new Set(loadLS("favourites", []));
let orders = loadLS("orders", []);


syncCounts();

function loadLS(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function money(n) {
    const x = Number(n) || 0;
    return x.toFixed(2);
}
function validImage(imgs) {
    if (Array.isArray(imgs)) {
        const hit = imgs.find(u => typeof u === "string" && /^https?:\/\//.test(u));
        return hit || "https://via.placeholder.com/600x400?text=No+Image";
    }
    return "https://via.placeholder.com/600x400?text=No+Image";
}
function openPopup(title, html) {
    popupTitle.textContent = title;
    popupBody.innerHTML = html;
    overlay.classList.remove("hidden");
}
function closePopup() { overlay.classList.add("hidden"); }
popupClose.addEventListener("click", closePopup);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closePopup(); });

function syncCounts() {
    cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
    favCountEl.textContent = favourites.size;
    ordersCountEl.textContent = orders.length;
}


async function loadProducts() {
    loader.classList.remove("hidden");
    try {
        const res = await fetch("https://api.escuelajs.co/api/v1/products");
        products = await res.json();

        products = products.filter(p => p && p.id && p.title && typeof p.price !== "undefined");
        applyFilter();
    } catch (err) {
        container.innerHTML = `<p class="text-red-600">Failed to load products.</p>`;
    } finally {
        loader.classList.add("hidden");
    }
}

function applyFilter() {
    const q = (searchInput?.value || "").toLowerCase();
    filtered = products.filter(p => p.title.toLowerCase().includes(q));
    visibleCount = Math.min(6, filtered.length || 0);
    renderProducts();
}

function renderProducts() {
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-gray-600 text-center col-span-full">No products found.</p>`;
        loadBtn.classList.add("hidden");
        return;
    }

    const list = filtered.slice(0, visibleCount);

    list.forEach((p, i) => {
        const isFav = favourites.has(p.id);
        const img = validImage(p.images);
        const card = document.createElement("div");
        card.className =
            "relative bg-white shadow rounded-xl flex flex-col transition transform  hover:shadow-lg duration-300 group";

        card.innerHTML = `
      <!-- Heart/Favourite button (top-right) -->
      <button 
        class="absolute top-2 right-2 rounded-full p-1  z-50"
        data-action="fav" data-id="${p.id}" aria-label="Add to favourites">
        <svg xmlns="http://www.w3.org/2000/svg"
             class="h-14 w-14"
             viewBox="0 0 24 24"
             stroke="${isFav ? "red" : "white"}" stroke-width="2"
             fill="${isFav ? "red" : "none"}">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 
               4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 
               4.5 0 010-6.364z" />
        </svg>
      </button>

      <!-- Product image -->
      <div class='h-64 w-full  overflow-hidden'>
      
   <img src="${img}" alt="${p.title}"
     class="h-full w-full object-cover rounded-lg mb-3 cursor-pointer group-hover:scale-110 transition-transform duration-800"
     onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'"/>
      </div>
      <div class='flex flex-col gap-2 p-5 group-hover:bg-slate-200'>
      
      <!-- Product title -->
      <h3 class="text-2xl font-semibold mb-2 line-clamp-1">${p.title}</h3>
      
      <!-- Description -->
      <p class="text-sm text-gray-600 flex-grow line-clamp-2">${(p.description || "").toString().slice(0, 120)}</p>
      
      <div class='flex gap-2 w-full justify-between items-center'>
       <!-- Price -->
      <p class="text-2xl font-semibold text-gray-800 mt-3">Price: $${money(p.price)}</p>
      <!-- Add to Cart button -->
      <button class="mt-3 text-base font-semibold flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              data-action="add-cart" data-id="${p.id}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a1 1 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
        </svg>
        Add to Cart
      </button>
      </div>
    
      </div>

    `;
        card.style.opacity = "0";
        card.style.translate = "0 8px";
        setTimeout(() => {
            card.style.transition = "opacity 300ms ease, transform 300ms ease";
            card.style.opacity = "1";
            card.style.translate = "0 0";
        }, 40 * i);

        container.appendChild(card);
    });


    if (visibleCount >= filtered.length) {
        loadBtn.textContent = "Show Less";
    } else {
        loadBtn.textContent = "Load More";
    }
    loadBtn.classList.remove("hidden");
}

container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const id = Number(btn.getAttribute("data-id"));
    const action = btn.getAttribute("data-action");
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (action === "fav") {

        const svg = btn.querySelector("svg");
        if (favourites.has(id)) {
            favourites.delete(id);
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "white");
        } else {
            favourites.add(id);
            svg.setAttribute("fill", "red");
            svg.setAttribute("stroke", "red");
        }
        saveLS("favourites", Array.from(favourites));
        syncCounts();
    }

    if (action === "add-cart") {

        const idx = cart.findIndex(i => i.id === id);
        if (idx >= 0) {
            cart[idx].qty += 1;
        } else {
            cart.push({ id, title: product.title, price: Number(product.price) || 0, image: validImage(product.images), qty: 1 });
        }
        saveLS("cart", cart);
        syncCounts();
    }
});

container.addEventListener("mouseover", (e) => {
    const btn = e.target.closest("[data-action='fav']");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    if (favourites.has(id)) return;
    const svg = btn.querySelector("svg");
    svg.setAttribute("stroke", "red");
    svg.setAttribute("fill", "red");
});
container.addEventListener("mouseout", (e) => {
    const btn = e.target.closest("[data-action='fav']");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    if (favourites.has(id)) return;
    const svg = btn.querySelector("svg");
    svg.setAttribute("stroke", "white");
    svg.setAttribute("fill", "none");
});

loadBtn.addEventListener("click", () => {
    if (visibleCount >= filtered.length) {

        visibleCount = Math.max(minVisible, visibleCount - step);
    } else {

        visibleCount = Math.min(filtered.length, visibleCount + step);
    }
    renderProducts();
});

if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
}


cartBtnHeader.addEventListener("click", () => {
    if (cart.length === 0) {
        openPopup("Cart", `<p class="text-gray-600">Your cart is empty.</p>`);
        return;
    }

    const itemsHTML = cart.map(item => `
    <div class="flex gap-3 items-center border rounded-lg p-3">
      <img src="${item.image}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <p class="font-medium">${item.title}</p>
        <p class="text-sm text-gray-600">$${money(item.price)} × ${item.qty}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded" data-qty-minus="${item.id}">-</button>
        <button class="px-2 py-1 border rounded" data-qty-plus="${item.id}">+</button>
        <button class="px-2 py-1 bg-red-600 text-white rounded" data-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join("");

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    openPopup("Cart", `
    <div class="space-y-3">${itemsHTML}</div>
    <div class="mt-4 flex justify-between items-center">
      <p class="text-lg font-semibold">Total: $${money(total)}</p>
      <button id="checkout-btn" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Checkout</button>
    </div>
  `);
});

favBtnHeader.addEventListener("click", () => {
    if (favourites.size === 0) {
        openPopup("Favourites", `<p class="text-gray-600">No favourites yet.</p>`);
        return;
    }
    const favItems = products.filter(p => favourites.has(p.id));
    const html = favItems.map(p => `
    <div class="flex gap-3 items-center border rounded-lg p-3">
      <img src="${validImage(p.images)}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <p class="font-medium">${p.title}</p>
        <p class="text-sm text-gray-600">$${money(p.price)}</p>
      </div>
      <button class="px-2 py-1 bg-red-600 text-white rounded" data-unfav="${p.id}">Remove</button>
    </div>
  `).join("");
    openPopup("Favourites", `<div class="space-y-3">${html}</div>`);
});

ordersBtnHeader.addEventListener("click", () => {
    if (orders.length === 0) {
        openPopup("Orders", `<p class="text-gray-600">No orders placed yet.</p>`);
        return;
    }
    const html = orders.map(o => `
    <div class="border rounded-lg p-3 space-y-2">
      <div class="flex justify-between">
        <p class="font-semibold">Order #${o.id}</p>
        <p class="text-sm text-gray-600">${new Date(o.date).toLocaleString()}</p>
      </div>
      ${o.items.map(i => `
        <div class="flex justify-between text-sm">
          <span>${i.title} × ${i.qty}</span>
          <span>$${money(i.price * i.qty)}</span>
        </div>
      `).join("")}
      <div class="border-t pt-2 flex justify-between font-semibold">
        <span>Total</span><span>$${money(o.total)}</span>
      </div>
    </div>
  `).join("");
    openPopup("Orders", `<div class="space-y-3">${html}</div>`);
});


popupBody.addEventListener("click", (e) => {
    const minus = e.target.closest("[data-qty-minus]");
    const plus = e.target.closest("[data-qty-plus]");
    const rem = e.target.closest("[data-remove]");
    const unfav = e.target.closest("[data-unfav]");

    if (minus) {
        const id = Number(minus.getAttribute("data-qty-minus"));
        const idx = cart.findIndex(i => i.id === id);
        if (idx >= 0) {
            cart[idx].qty = Math.max(1, cart[idx].qty - 1);
            saveLS("cart", cart);
            syncCounts();
            cartBtnHeader.click();
        }
    }
    if (plus) {
        const id = Number(plus.getAttribute("data-qty-plus"));
        const idx = cart.findIndex(i => i.id === id);
        if (idx >= 0) {
            cart[idx].qty += 1;
            saveLS("cart", cart);
            syncCounts();
            cartBtnHeader.click();
        }
    }
    if (rem) {
        const id = Number(rem.getAttribute("data-remove"));
        cart = cart.filter(i => i.id !== id);
        saveLS("cart", cart);
        syncCounts();
        cartBtnHeader.click();
    }
    if (unfav) {
        const id = Number(unfav.getAttribute("data-unfav"));
        favourites.delete(id);
        saveLS("favourites", Array.from(favourites));
        syncCounts();
        favBtnHeader.click();

        const btn = container.querySelector(`[data-action="fav"][data-id="${id}"]`);
        if (btn) {
            const svg = btn.querySelector("svg");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "white");
        }
    }
});


overlay.addEventListener("click", (e) => {
    if (e.target.id === "checkout-btn") {
        if (cart.length === 0) return;
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const order = {
            id: (orders[orders.length - 1]?.id || 0) + 1,
            date: Date.now(),
            items: cart.map(i => ({ ...i })),
            total
        };
        orders.push(order);
        saveLS("orders", orders);
        cart = [];
        saveLS("cart", cart);
        syncCounts();
        ordersBtnHeader.click();
    }
});


loadProducts();
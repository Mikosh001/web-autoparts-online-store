"use strict";
(() => {
  const AP = window.AutoParts;
  const storageKey = "autoparts-endterm-v1";
  AP.money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  AP.escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  AP.getProduct = id => AP.products.find(product => product.id === id);
  AP.categoryName = id => AP.categories.find(category => category.id === id)?.name || id;

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      const seen = new Set();
      const cart = [];
      // Treat browser storage as untrusted: ignore removed IDs and invalid quantities.
      for (const item of Array.isArray(saved.cart) ? saved.cart : []) {
        if (item && AP.getProduct(item.id) && !seen.has(item.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99) {
          seen.add(item.id);
          cart.push({ id: item.id, quantity: item.quantity });
        }
      }
      const favorites = [...new Set((Array.isArray(saved.favorites) ? saved.favorites : []).filter(id => AP.getProduct(id)))];
      return {
        cart, favorites, theme: saved.theme === "dark" ? "dark" : "light",
        delivery: ["standard", "express", "pickup"].includes(saved.delivery) ? saved.delivery : "standard",
        coupon: saved.coupon === "ENDTERM10" ? saved.coupon : ""
      };
    } catch {
      return { cart: [], favorites: [], theme: "light", delivery: "standard", coupon: "" };
    }
  }
  AP.state = readState();
  AP.saveState = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(AP.state)); }
    catch { AP.announce("Browser storage is unavailable. Changes will last for this page only."); }
    document.dispatchEvent(new CustomEvent("store:change"));
  };
  let noticeTimer;
  AP.announce = message => {
    const notice = document.getElementById("site-notice");
    if (!notice) return;
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 4500);
  };
  AP.toggleFavorite = id => {
    if (!AP.getProduct(id)) return;
    const index = AP.state.favorites.indexOf(id);
    if (index === -1) AP.state.favorites.push(id);
    else AP.state.favorites.splice(index, 1);
    AP.saveState();
    AP.announce(index === -1 ? "Added to favorites." : "Removed from favorites.");
  };
  AP.productCard = (product, heading = "h2") => {
    const favorite = AP.state.favorites.includes(product.id);
    return `<article class="product-card" id="product-${product.id}">
      <img class="product-image" src="assets/${product.image}" alt="${AP.escapeHTML(product.name)}" loading="lazy">
      <div class="product-meta"><span>SKU: ${product.sku}</span><span class="rating"><img src="assets/star.svg" alt="Rated"> ${product.rating.toFixed(1)} / 5</span></div>
      <${heading}>${AP.escapeHTML(product.name)}</${heading}><p class="price">${AP.money(product.price)}</p>
      <div class="card-actions"><button type="button" class="add-cart" data-add="${product.id}">ADD TO CART</button>
      <button type="button" class="favorite-button" data-favorite="${product.id}" aria-label="Favorite ${AP.escapeHTML(product.name)}" aria-pressed="${favorite}">${favorite ? "♥" : "♡"}</button></div>
      <button type="button" class="details-button" data-details="${product.id}" aria-expanded="false" aria-controls="details-${product.id}">Part details</button>
      <p class="part-details" id="details-${product.id}" hidden>${AP.escapeHTML(product.description)}</p></article>`;
  };

  function updateHeader() {
    const count = AP.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach(badge => { badge.textContent = String(count); });
    document.querySelectorAll("[data-favorite-count]").forEach(badge => { badge.textContent = String(AP.state.favorites.length); });
    document.querySelectorAll("[data-favorite]").forEach(button => {
      const active = AP.state.favorites.includes(button.dataset.favorite);
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "♥" : "♡";
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.dataset.theme = AP.state.theme;
    const themeButton = document.getElementById("theme-toggle");
    const updateThemeButton = () => {
      themeButton.textContent = AP.state.theme === "dark" ? "Light mode" : "Dark mode";
      themeButton.setAttribute("aria-pressed", String(AP.state.theme === "dark"));
    };
    themeButton.addEventListener("click", () => {
      AP.state.theme = AP.state.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = AP.state.theme;
      updateThemeButton();
      AP.saveState();
    });
    updateThemeButton();
    updateHeader();
    document.addEventListener("store:change", updateHeader);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") document.querySelectorAll(".mobile-nav[open]").forEach(menu => { menu.open = false; menu.querySelector("summary").focus(); });
    });
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-favorite]");
      if (button) AP.toggleFavorite(button.dataset.favorite);
      if (!event.target.closest(".mobile-nav")) document.querySelectorAll(".mobile-nav[open]").forEach(menu => { menu.open = false; });
    });
  });
})();

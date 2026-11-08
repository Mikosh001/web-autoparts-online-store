"use strict";
(() => {
  const AP = window.AutoParts;
  // Integer cents keep discount and delivery calculations consistent with the display.
  AP.getCartQuote = (cart, delivery = "standard", coupon = "") => {
    const subtotal = cart.reduce((sum, item) => sum + Math.round(AP.getProduct(item.id).price * 100) * item.quantity, 0);
    const discount = coupon === "ENDTERM10" ? Math.round(subtotal * 0.1) : 0;
    const afterDiscount = subtotal - discount;
    const shipping = !cart.length || delivery === "pickup" ? 0 : delivery === "express" ? 3000 : afterDiscount >= 30000 ? 0 : 1500;
    return { subtotal, discount, shipping, total: afterDiscount + shipping, freeShippingRemaining: Math.max(0, 30000 - afterDiscount), itemCount: cart.reduce((count, item) => count + item.quantity, 0) };
  };
  AP.cartTotal = () => AP.getCartQuote(AP.state.cart).subtotal / 100;
  AP.quote = () => AP.getCartQuote(AP.state.cart, AP.state.delivery, AP.state.coupon);
  AP.addToCart = id => {
    const product = AP.getProduct(id);
    if (!product) return false;
    const existing = AP.state.cart.find(item => item.id === id);
    if (existing?.quantity === 99) { AP.announce("Maximum quantity is 99 per product."); return false; }
    if (existing) existing.quantity += 1;
    else AP.state.cart.push({ id, quantity: 1 });
    AP.saveState();
    AP.announce(`${product.name} added. Open Cart to review your order.`);
    return true;
  };
  AP.setQuantity = (id, quantity) => {
    const item = AP.state.cart.find(entry => entry.id === id);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return false;
    item.quantity = quantity;
    AP.saveState();
    return true;
  };
  document.addEventListener("DOMContentLoaded", () => {
    let removedItems = [];
    const list = document.getElementById("cart-items");
    function renderCart() {
      if (!list) return;
      list.replaceChildren();
      AP.state.cart.forEach(item => {
        const product = AP.getProduct(item.id);
        const row = document.createElement("li");
        row.className = "cart-row";
        row.innerHTML = `<div class="cart-product"><img src="assets/${product.image}" alt=""><div><a href="products.html#product-${item.id}">${AP.escapeHTML(product.name)}</a><small>${product.sku} · ${AP.money(product.price)} each</small></div></div>
          <div class="cart-quantity"><label class="visually-hidden" for="quantity-${item.id}">Quantity for ${AP.escapeHTML(product.name)}</label>
          <button type="button" data-adjust="${item.id}" data-step="-1" aria-label="Decrease ${AP.escapeHTML(product.name)}" ${item.quantity === 1 ? "disabled" : ""}>−</button>
          <input class="form-control" id="quantity-${item.id}" data-quantity="${item.id}" type="number" min="1" max="99" step="1" value="${item.quantity}">
          <button type="button" data-adjust="${item.id}" data-step="1" aria-label="Increase ${AP.escapeHTML(product.name)}" ${item.quantity === 99 ? "disabled" : ""}>+</button></div>
          <strong>${AP.money(product.price * item.quantity)}</strong>
          <div class="cart-row-actions"><button type="button" class="text-button" data-save-later="${item.id}" aria-label="Save ${AP.escapeHTML(product.name)} for later">Save for later</button>
          <button type="button" class="text-button" data-remove="${item.id}" aria-label="Remove ${AP.escapeHTML(product.name)}">Remove</button></div>`;
        list.append(row);
      });
      const quote = AP.quote();
      const empty = !AP.state.cart.length;
      document.getElementById("empty-cart").hidden = !empty;
      document.getElementById("cart-filled").hidden = empty;
      document.getElementById("clear-cart").disabled = empty;
      document.getElementById("undo-remove").hidden = !removedItems.length;
      document.getElementById("cart-item-count").textContent = `${quote.itemCount} ${quote.itemCount === 1 ? "item" : "items"}`;
      for (const key of ["subtotal", "discount", "shipping", "total"]) document.getElementById(`cart-${key}`).textContent = `${key === "discount" && quote.discount ? "−" : ""}${AP.money(quote[key] / 100)}`;
      document.getElementById("discount-row").hidden = !quote.discount;
      document.getElementById("delivery-method").value = AP.state.delivery;
      document.getElementById("remove-coupon").hidden = !AP.state.coupon;
      document.getElementById("coupon-status").textContent = AP.state.coupon ? "ENDTERM10 applied: 10% off products." : "Try ENDTERM10 for 10% off products.";
      document.getElementById("shipping-progress").value = Math.min(30000, quote.subtotal - quote.discount);
      document.getElementById("shipping-hint").textContent = empty ? "Free standard delivery from $300 after discounts." : quote.freeShippingRemaining ? `Add ${AP.money(quote.freeShippingRemaining / 100)} after discounts for free standard delivery.` : "You qualify for free standard delivery. Select Standard to use it.";
      document.getElementById("checkout-section").hidden = empty;
    }
    function removeProduct(id, saveForLater = false) {
      const item = AP.state.cart.find(entry => entry.id === id);
      if (!item) return;
      removedItems = [{ ...item }];
      if (saveForLater && !AP.state.favorites.includes(id)) AP.state.favorites.push(id);
      AP.state.cart = AP.state.cart.filter(entry => entry.id !== id);
      AP.saveState();
      AP.announce(saveForLater ? "Saved in Favorites. You can restore it with Undo." : "Product removed. You can restore it with Undo.");
      document.getElementById("undo-remove")?.focus();
    }
    document.addEventListener("click", event => {
      const add = event.target.closest("[data-add]");
      if (add) AP.addToCart(add.dataset.add);
      const remove = event.target.closest("[data-remove]");
      if (remove) removeProduct(remove.dataset.remove);
      const save = event.target.closest("[data-save-later]");
      if (save) removeProduct(save.dataset.saveLater, true);
      const adjust = event.target.closest("[data-adjust]");
      if (adjust) {
        const item = AP.state.cart.find(entry => entry.id === adjust.dataset.adjust);
        if (item && AP.setQuantity(item.id, item.quantity + Number(adjust.dataset.step))) {
          document.getElementById(`quantity-${item.id}`)?.focus();
          AP.announce("Quantity and order total updated.");
        }
      }
    });
    list?.addEventListener("change", event => {
      const input = event.target.closest("[data-quantity]");
      if (!input) return;
      const item = AP.state.cart.find(entry => entry.id === input.dataset.quantity);
      if (!item) return;
      if (!AP.setQuantity(item.id, Number(input.value))) {
        input.value = item.quantity;
        AP.announce("Enter a whole quantity from 1 to 99.");
      } else {
        document.getElementById(input.id)?.focus();
        AP.announce("Quantity and order total updated.");
      }
    });
    document.getElementById("clear-cart")?.addEventListener("click", () => {
      removedItems = AP.state.cart.map(item => ({ ...item }));
      AP.state.cart = [];
      AP.saveState();
      AP.announce("Cart cleared. Undo restores the removed items.");
      document.getElementById("undo-remove").focus();
    });
    document.getElementById("undo-remove")?.addEventListener("click", () => {
      for (const removed of removedItems) {
        const item = AP.state.cart.find(entry => entry.id === removed.id);
        if (item) item.quantity = Math.min(99, item.quantity + removed.quantity);
        else AP.state.cart.push({ ...removed });
      }
      removedItems = [];
      AP.saveState();
      document.getElementById("cart-heading").focus();
      AP.announce("Removed items restored.");
    });
    document.getElementById("delivery-method")?.addEventListener("change", event => { AP.state.delivery = event.target.value; AP.saveState(); });
    const couponInput = document.getElementById("coupon-code");
    if (couponInput) couponInput.value = AP.state.coupon;
    couponInput?.addEventListener("input", () => {
      document.getElementById("coupon-code-error").textContent = "";
      couponInput.setAttribute("aria-invalid", "false");
    });
    document.getElementById("coupon-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const input = document.getElementById("coupon-code");
      const code = input.value.trim().toUpperCase();
      const error = document.getElementById("coupon-code-error");
      error.textContent = code === "ENDTERM10" ? "" : "Unknown code. Try ENDTERM10.";
      input.setAttribute("aria-invalid", String(code !== "ENDTERM10"));
      if (code !== "ENDTERM10") return;
      AP.state.coupon = code;
      input.value = code;
      AP.saveState();
      AP.announce("10% product discount applied.");
    });
    document.getElementById("remove-coupon")?.addEventListener("click", () => {
      AP.state.coupon = "";
      couponInput.value = "";
      document.getElementById("coupon-code-error").textContent = "";
      document.getElementById("coupon-code").setAttribute("aria-invalid", "false");
      AP.saveState();
    });
    document.addEventListener("store:change", renderCart);
    renderCart();
  });
})();

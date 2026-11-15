"use strict";
(() => {
  const AP = window.AutoParts;
  const key = "autoparts-final-recent-v1";
  function validIds(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(id => typeof id === "string" && AP.getProduct(id)))].slice(0, 5);
  }
  let ids = validIds(AP.storage.read(key, []));
  AP.recent = {
    validIds,
    list: () => [...ids],
    add(id) {
      if (!AP.getProduct(id)) return;
      ids = [id, ...ids.filter(value => value !== id)].slice(0, 5);
      AP.storage.write(key, ids);
      document.dispatchEvent(new CustomEvent("recent:change"));
    },
    clear() {
      ids = [];
      AP.storage.write(key, ids);
      document.dispatchEvent(new CustomEvent("recent:change"));
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("recent-products");
    if (!list) return;
    const clear = document.getElementById("clear-recent");
    function render() {
      list.replaceChildren();
      for (const id of ids) {
        const product = AP.getProduct(id);
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `products.html#product-${id}`;
        link.textContent = product.name;
        const price = document.createElement("span");
        price.textContent = AP.money(product.price);
        item.append(link, price);
        list.append(item);
      }
      document.getElementById("recent-empty").hidden = ids.length > 0;
      document.getElementById("recent-storage").hidden = !AP.storage.failed;
      clear.disabled = ids.length === 0;
    }
    clear.addEventListener("click", () => { AP.recent.clear(); AP.announce("Recently viewed cleared. Your cart and favorites are unchanged."); });
    document.addEventListener("recent:change", render);
    render();
  });
})();

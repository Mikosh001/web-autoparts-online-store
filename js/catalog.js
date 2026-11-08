"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const AP = window.AutoParts;
  const form = document.getElementById("filter-form");
  const search = document.getElementById("product-search");
  const sort = document.getElementById("sort-products");
  const favoritesOnly = document.getElementById("favorites-only");
  const grid = document.getElementById("product-grid");
  const params = new URLSearchParams(location.search);
  search.value = params.get("q") || "";
  const category = params.get("category");
  const radio = [...form.elements.category].find(input => input.value === category);
  if (radio) radio.checked = true;

  function filterProducts(products, query, categoryId, priceRange, onlyFavorites) {
    return products.filter(product => {
      const matchesQuery = `${product.name} ${product.sku} ${AP.categoryName(product.category)}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = categoryId === "all" || product.category === categoryId;
      const matchesPrice = priceRange === "all" || (priceRange === "low" && product.price < 100) || (priceRange === "mid" && product.price >= 100 && product.price <= 200) || (priceRange === "high" && product.price > 200);
      return matchesQuery && matchesCategory && matchesPrice && (!onlyFavorites || AP.state.favorites.includes(product.id));
    });
  }
  function renderProducts() {
    const products = filterProducts(AP.products, search.value, form.elements.category.value, form.elements.price.value, favoritesOnly.checked);
    if (sort.value === "price-asc") products.sort((a, b) => a.price - b.price);
    if (sort.value === "price-desc") products.sort((a, b) => b.price - a.price);
    if (sort.value === "name") products.sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = products.map(product => AP.productCard(product)).join("");
    document.getElementById("result-count").textContent = `${products.length} of ${AP.products.length} products`;
    document.getElementById("catalog-empty").hidden = products.length > 0;
    document.getElementById("comparison-body").innerHTML = products.map(product => `<tr><th scope="row">${AP.escapeHTML(product.name)}</th><td>${AP.escapeHTML(AP.categoryName(product.category))}</td><td>${AP.money(product.price)}</td></tr>`).join("");
    document.getElementById("comparison-count").textContent = products.length ? "Matches the current catalog filters." : "No matching products to compare.";
  }
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("change", renderProducts);
  search.addEventListener("input", renderProducts);
  sort.addEventListener("change", renderProducts);
  favoritesOnly.addEventListener("change", renderProducts);
  function resetFilters() {
    form.reset(); search.value = ""; sort.value = "featured"; favoritesOnly.checked = false;
    renderProducts();
  }
  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("empty-reset").addEventListener("click", resetFilters);
  document.addEventListener("store:change", () => { if (favoritesOnly.checked) renderProducts(); });
  renderProducts();
  if (location.hash.startsWith("#product-")) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});

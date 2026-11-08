"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const AP = window.AutoParts;
  const featured = document.getElementById("featured-products");
  function renderFeatured() {
    featured.innerHTML = AP.products.slice(0, 3).map(product => AP.productCard(product, "h3")).join("");
  }
  renderFeatured();
  document.getElementById("home-categories").innerHTML = AP.categories.slice(0, 4).map(category => `<a class="home-category" href="products.html?category=${category.id}">
    <img class="category-image" src="assets/${category.image}" alt="" loading="lazy"><div class="category-label"><h3>${AP.escapeHTML(category.name)}</h3><p>Browse parts →</p></div></a>`).join("");
  document.getElementById("quick-search").addEventListener("submit", event => {
    event.preventDefault();
    const query = document.getElementById("home-search").value.trim();
    window.location.href = `products.html?q=${encodeURIComponent(query)}`;
  });
});

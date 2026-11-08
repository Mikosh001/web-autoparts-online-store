"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const AP = window.AutoParts;
  const search = document.getElementById("category-search");
  const grid = document.getElementById("category-grid");
  function renderCategories(query = "") {
    const categories = AP.categories.filter(category => `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase().trim()));
    grid.replaceChildren();
    // Each matching category is a new DOM node, rather than a hard-coded card.
    for (const category of categories) {
      const column = document.createElement("div");
      column.className = "col-md-6 col-lg-4";
      const count = AP.products.filter(product => product.category === category.id).length;
      column.innerHTML = `<article class="category-card" id="${category.id}"><img class="category-picture" src="assets/${category.image}" alt="${AP.escapeHTML(category.name)}" loading="lazy">
        <div class="category-copy"><h2>${AP.escapeHTML(category.name)}</h2><p>${AP.escapeHTML(category.description)}</p><p class="category-stock">${count} catalog item</p>
        <a href="products.html?category=${category.id}">EXPLORE CATEGORY <img src="assets/chevron-right.svg" alt=""></a></div></article>`;
      grid.append(column);
    }
    document.getElementById("category-count").textContent = `${categories.length} of ${AP.categories.length} categories`;
    document.getElementById("category-empty").hidden = categories.length > 0;
  }
  search.addEventListener("input", event => renderCategories(event.target.value));
  document.getElementById("category-reset").addEventListener("click", () => { search.value = ""; renderCategories(); search.focus(); });
  renderCategories();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});

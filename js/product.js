"use strict";
window.Product = class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.category = data.category;
    this.price = data.price;
    this.image = data.image;
    this.rating = data.rating;
    this.description = data.description;
  }

  matches(query, categoryName) {
    const text = `${this.name} ${this.sku} ${categoryName}`;
    return text.toLowerCase().includes(query.trim().toLowerCase());
  }

  priceInCents() {
    return Math.round(this.price * 100);
  }
};

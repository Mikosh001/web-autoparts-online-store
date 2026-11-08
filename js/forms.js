"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const AP = window.AutoParts;
  function validateField(field) {
    const value = field.value.trim();
    if (field.type === "checkbox") return field.checked ? "" : "Please confirm before continuing.";
    if (!value && field.required) return "This field is required.";
    if (!value) return "";
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter an email address such as name@example.com.";
    if (field.type === "tel" && !/^\+?[\d\s()-]{7,20}$/.test(value)) return "Use 7–15 digits with optional +, spaces, brackets or hyphens.";
    if (field.type === "tel" && (value.replace(/\D/g, "").length < 7 || value.replace(/\D/g, "").length > 15)) return "Phone number must contain 7–15 digits.";
    const min = Number(field.dataset.min || 0);
    if (value.length < min) return `Enter at least ${min} characters.`;
    if (field.maxLength > 0 && value.length > field.maxLength) return `Use no more than ${field.maxLength} characters.`;
    if (field.tagName === "SELECT" && ![...field.options].some(option => option.value === value)) return "Choose an available topic.";
    return "";
  }
  function showFieldError(field, message) {
    document.getElementById(`${field.id}-error`).textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
  }
  function addDownloadLink(container, text, filename) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.className = "btn orange-button";
    link.href = url;
    link.download = filename;
    link.textContent = "Download inquiry";
    container.append(link);
    return url;
  }
  document.querySelectorAll("form[data-validate]").forEach(form => {
    const fields = [...form.querySelectorAll("[data-validate-field]")];
    const result = form.querySelector(".form-result");
    const summary = form.querySelector(".form-summary");
    let downloadURL;
    let submitted = false;
    function clearResult() {
      result.hidden = true;
      result.replaceChildren();
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      downloadURL = undefined;
    }
    fields.forEach(field => {
      field.addEventListener("blur", () => showFieldError(field, validateField(field)));
      field.addEventListener("input", () => {
        clearResult();
        if (submitted || field.getAttribute("aria-invalid") === "true") showFieldError(field, validateField(field));
      });
      field.addEventListener("change", () => { clearResult(); if (submitted) showFieldError(field, validateField(field)); });
    });
    if (form.id === "order-form") document.addEventListener("store:change", clearResult);
    form.addEventListener("submit", event => {
      event.preventDefault();
      submitted = true;
      clearResult();
      let firstInvalid;
      fields.forEach(field => {
        const error = validateField(field);
        showFieldError(field, error);
        if (error && !firstInvalid) firstInvalid = field;
      });
      const emptyOrder = form.id === "order-form" && !AP.state.cart.length;
      if (firstInvalid || emptyOrder) {
        summary.hidden = false;
        summary.textContent = emptyOrder ? "Add at least one product to your cart, then check the fields below." : "Please correct the highlighted fields.";
        (firstInvalid || summary).focus();
        return;
      }
      summary.hidden = true;
      const values = fields.filter(field => field.type !== "checkbox").map(field => `${field.dataset.label}: ${field.value.trim()}`);
      const lines = ["AutoParts Store inquiry", `Prepared: ${new Date().toISOString()}`, "", ...values];
      if (form.id === "order-form") {
        lines.push("", "Products:");
        for (const item of AP.state.cart) {
          const product = AP.getProduct(item.id);
          lines.push(`${product.sku} | ${product.name} | ${item.quantity} × ${AP.money(product.price)} = ${AP.money(item.quantity * product.price)}`);
        }
        const quote = AP.quote();
        lines.push(`Product subtotal: ${AP.money(quote.subtotal / 100)}`, `Discount: ${AP.money(quote.discount / 100)}${AP.state.coupon ? ` (${AP.state.coupon})` : ""}`, `Delivery: ${AP.state.delivery} — ${AP.money(quote.shipping / 100)}`, `Estimated total: ${AP.money(quote.total / 100)}`, "Demo estimate. Shipping, availability and final price require store confirmation.");
      }
      const message = document.createElement("p");
      message.textContent = "Your inquiry is ready. Download it and send it to supportautopartsstore@gmail.com. Nothing has been sent automatically.";
      result.append(message);
      downloadURL = addDownloadLink(result, lines.join("\n"), form.id === "order-form" ? "autoparts-order-inquiry.txt" : "autoparts-contact-inquiry.txt");
      result.hidden = false;
      result.focus();
    });
    form.addEventListener("reset", () => {
      submitted = false;
      clearResult();
      summary.hidden = true;
      fields.forEach(field => showFieldError(field, ""));
    });
  });
});

"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const AP = window.AutoParts;
  const form = document.getElementById("request-form");
  const product = document.getElementById("request-product");
  const quantity = document.getElementById("request-quantity");
  const note = document.getElementById("request-note");
  const status = document.getElementById("request-status");
  const feedback = document.getElementById("request-feedback");
  const list = document.getElementById("request-list");
  let editing = null;
  for (const item of AP.products) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} · ${item.sku}`;
    product.append(option);
  }
  function reset() {
    editing = null;
    form.reset();
    document.getElementById("request-heading").textContent = "Save a part request";
    document.getElementById("save-request").textContent = "Save request";
    document.getElementById("cancel-request").hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach(field => field.removeAttribute("aria-invalid"));
    feedback.textContent = "";
  }
  function render() {
    list.replaceChildren();
    const records = AP.requests.list();
    document.getElementById("requests-empty").hidden = records.length > 0;
    document.getElementById("requests-storage").hidden = !AP.storage.failed;
    document.getElementById("request-count").textContent = `${records.length} ${records.length === 1 ? "saved request" : "saved requests"}`;
    for (const record of records) {
      const item = document.createElement("article");
      item.className = "request-card";
      const heading = document.createElement("h3");
      const part = AP.getProduct(record.productId);
      heading.textContent = part.name;
      const details = document.createElement("p");
      details.textContent = `${part.sku} · Quantity: ${record.quantity} · Status: ${record.status}`;
      const noteText = document.createElement("p");
      noteText.className = "request-note";
      noteText.textContent = record.note || "No note added.";
      const created = document.createElement("p");
      created.className = "section-note";
      created.textContent = `Created ${new Date(record.createdAt).toLocaleString()}`;
      const actions = document.createElement("div");
      actions.className = "request-actions";
      for (const action of ["edit", "delete"]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-outline-secondary";
        button.dataset.action = action;
        button.dataset.id = record.id;
        button.textContent = action === "edit" ? "Edit" : "Delete";
        button.setAttribute("aria-label", `${button.textContent} request for ${part.name}`);
        actions.append(button);
      }
      item.append(heading, details, noteText, created, actions);
      list.append(item);
    }
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const value = { productId: product.value, quantity: Number(quantity.value), note: note.value, status: status.value };
    const error = AP.requests.errorFor(value);
    feedback.textContent = error;
    for (const field of [product, quantity, note, status]) field.setAttribute("aria-invalid", "false");
    if (error) {
      let field = status;
      if (!AP.getProduct(value.productId)) field = product;
      else if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 99) field = quantity;
      else if (value.note.length > 200) field = note;
      field.setAttribute("aria-invalid", "true");
      field.focus();
      return;
    }
    try {
      if (editing) AP.requests.update(editing, value);
      else AP.requests.create(value);
      reset();
      AP.announce(AP.storage.failed ? "Request saved for this page only. Browser storage is unavailable." : "Part request saved in this browser.");
      product.focus();
    } catch (error) { feedback.textContent = error.message; }
  });
  document.getElementById("cancel-request").addEventListener("click", () => { reset(); product.focus(); });
  list.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const record = AP.requests.list().find(item => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "delete") {
      if (editing === record.id) reset();
      AP.requests.remove(record.id);
      AP.announce("Part request deleted.");
      product.focus();
      return;
    }
    editing = record.id;
    product.value = record.productId;
    quantity.value = record.quantity;
    note.value = record.note;
    status.value = record.status;
    document.getElementById("request-heading").textContent = "Edit part request";
    document.getElementById("save-request").textContent = "Update request";
    document.getElementById("cancel-request").hidden = false;
    feedback.textContent = "";
    product.focus();
  });
  document.addEventListener("requests:change", render);
  render();
});

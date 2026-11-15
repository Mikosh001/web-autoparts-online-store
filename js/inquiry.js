"use strict";
(() => {
  const AP = window.AutoParts;
  AP.inquiry = {
    cartError() {
      if (!AP.state.cart.length) return "Add at least one product before continuing.";
      const invalid = AP.state.cart.some(item => !AP.getProduct(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99);
      return invalid ? "Check the selected products and quantities (1–99)." : "";
    },
    text(values) {
      const lines = ["AutoParts Store inquiry", `Prepared: ${new Date().toISOString()}`, "", `Full name: ${values.name}`, `Email address: ${values.email}`, `Vehicle: ${values.vehicle}`];
      if (AP.state.delivery !== "pickup") lines.push(`Delivery address: ${values.address}`);
      if (values.message) lines.push(`Message: ${values.message}`);
      lines.push("", "Products:");
      for (const item of AP.state.cart) {
        const product = AP.getProduct(item.id);
        lines.push(`${product.sku} | ${product.name} | ${item.quantity} × ${AP.money(product.price)} = ${AP.money(product.price * item.quantity)}`);
      }
      const quote = AP.quote();
      lines.push("", `Product subtotal: ${AP.money(quote.subtotal / 100)}`, `Discount: ${AP.money(quote.discount / 100)}${AP.state.coupon ? ` (${AP.state.coupon})` : ""}`, `Delivery: ${AP.state.delivery} — ${AP.money(quote.shipping / 100)}`, `Estimated total: ${AP.money(quote.total / 100)}`);
      const converted = AP.conversionText(quote.total);
      if (converted) lines.push(`${converted}. Rate update: ${new Date(AP.rates.data.updated).toISOString()}. Source: ExchangeRate-API.`);
      lines.push("", "Demo estimate. Shipping, availability and final price require store confirmation.", "Download this inquiry and email it to supportautopartsstore@gmail.com. Nothing has been sent automatically.");
      return lines.join("\n");
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("order-form");
    if (!form) return;
    const panels = [...form.querySelectorAll("[data-inquiry-step]")];
    const fields = [...form.querySelectorAll("[data-validate-field]")];
    const summary = form.querySelector(".form-summary");
    const result = form.querySelector(".form-result");
    const address = document.getElementById("order-address");
    const review = document.getElementById("inquiry-review");
    const previous = document.getElementById("inquiry-back");
    const next = document.getElementById("inquiry-next");
    const prepare = document.getElementById("inquiry-prepare");
    let step = 0;
    let url;
    function values() {
      const result = {};
      for (const name of ["name", "email", "vehicle", "address", "message"]) result[name] = document.getElementById(`order-${name}`).value.trim();
      return result;
    }
    function invalidate() {
      if (url) URL.revokeObjectURL(url);
      url = undefined;
      result.hidden = true;
      result.replaceChildren();
    }
    function deliveryFields() {
      const pickup = AP.state.delivery === "pickup";
      address.required = !pickup;
      address.disabled = pickup;
      document.getElementById("delivery-address-field").hidden = pickup;
      document.getElementById("pickup-note").hidden = !pickup;
      if (pickup) AP.forms.showFieldError(address, "");
    }
    function refresh() {
      deliveryFields();
      const count = AP.quote().itemCount;
      document.getElementById("inquiry-product-check").textContent = `${count} selected items. Review quantities above; estimated total ${AP.money(AP.quote().total / 100)}.`;
      if (!AP.inquiry.cartError()) review.textContent = AP.inquiry.text(values());
      else review.textContent = "Your cart is empty. Choose products before preparing an inquiry.";
    }
    function showStep(value, focus = true) {
      step = value;
      panels.forEach((panel, index) => { panel.hidden = index !== step; });
      form.querySelectorAll("[data-step-indicator]").forEach((item, index) => {
        if (index === step) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      document.getElementById("inquiry-progress").value = step + 1;
      document.getElementById("inquiry-step-status").textContent = `Step ${step + 1} of 3`;
      previous.hidden = step === 0;
      next.hidden = step === 2;
      prepare.hidden = step !== 2;
      summary.hidden = true;
      invalidate();
      refresh();
      if (focus) panels[step].querySelector("h3").focus();
    }
    function validate(panel) {
      let first;
      for (const field of panel.querySelectorAll("[data-validate-field]")) {
        const message = AP.forms.validateField(field);
        AP.forms.showFieldError(field, message);
        if (message && !first) first = field;
      }
      if (first) {
        summary.textContent = "Please correct the highlighted fields.";
        summary.hidden = false;
        first.focus();
        return false;
      }
      return true;
    }
    function cartIsValid() {
      const error = AP.inquiry.cartError();
      if (!error) return true;
      summary.textContent = error;
      summary.hidden = false;
      summary.focus();
      return false;
    }
    next.addEventListener("click", () => {
      if (!cartIsValid() || !validate(panels[step])) return;
      showStep(Math.min(2, step + 1));
    });
    previous.addEventListener("click", () => showStep(Math.max(0, step - 1)));
    fields.forEach(field => {
      field.addEventListener("input", () => {
        invalidate();
        summary.hidden = true;
        if (field.getAttribute("aria-invalid") === "true") AP.forms.showFieldError(field, AP.forms.validateField(field));
        refresh();
      });
      field.addEventListener("change", () => { invalidate(); refresh(); });
      field.addEventListener("blur", () => AP.forms.showFieldError(field, AP.forms.validateField(field)));
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (step !== 2) { next.click(); return; }
      invalidate();
      deliveryFields();
      if (!cartIsValid()) return;
      for (let index = 1; index < panels.length; index += 1) {
        const invalid = [...panels[index].querySelectorAll("[data-validate-field]")].some(field => AP.forms.validateField(field));
        if (invalid) { showStep(index, false); validate(panels[index]); return; }
      }
      refresh();
      const message = document.createElement("p");
      message.textContent = "Your inquiry matches the review above. Download it and email it to our team.";
      result.append(message);
      url = AP.forms.addDownloadLink(result, review.textContent, "autoparts-order-inquiry.txt");
      result.hidden = false;
      result.focus();
    });
    document.addEventListener("store:change", () => {
      invalidate();
      refresh();
      if (step === 2 && !AP.state.cart.length) showStep(0, false);
    });
    document.addEventListener("currency:change", () => { invalidate(); refresh(); });
    document.addEventListener("auth:change", () => { invalidate(); refresh(); });
    showStep(0, false);
  });
})();

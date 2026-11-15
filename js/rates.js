"use strict";
(() => {
  const AP = window.AutoParts;
  const endpoint = "https://open.er-api.com/v6/latest/USD";
  const key = "autoparts-final-rates-v1";
  const day = 24 * 60 * 60 * 1000;
  let pending;
  function validCache(value, now = Date.now()) {
    return Boolean(value && value.base === "USD" && value.rates &&
      [value.rates.KZT, value.rates.EUR].every(rate => typeof rate === "number" && Number.isFinite(rate) && rate > 0) &&
      Number.isFinite(value.updated) && value.updated > 0 && value.updated <= now + 300000 &&
      Number.isFinite(value.fetched) && value.fetched <= now && value.fetched >= now - day &&
      Number.isFinite(value.expires) && value.expires > now && value.expires <= value.fetched + day && value.updated < value.expires);
  }
  function parseRates(data, now = Date.now()) {
    if (!data || data.result !== "success" || data.base_code !== "USD") throw new Error("The provider returned an invalid response.");
    if (!data.rates || !Object.keys(data.rates).length || data.rates.KZT === undefined || data.rates.EUR === undefined) return null;
    const value = { base: "USD", rates: { KZT: data.rates.KZT, EUR: data.rates.EUR }, updated: data.time_last_update_unix * 1000, fetched: now, expires: Math.min(data.time_next_update_unix * 1000, now + day) };
    if (!validCache(value, now)) throw new Error("The provider returned invalid or expired rates.");
    return value;
  }
  const saved = AP.storage.read(key, null);
  const choice = AP.storage.read("autoparts-final-currency-v1", "USD");
  AP.currency = ["USD", "KZT", "EUR"].includes(choice) ? choice : "USD";
  AP.rates = { data: validCache(saved) ? saved : null, status: "idle", message: "", validCache, parseRates };
  AP.conversionText = cents => {
    if (AP.currency === "USD" || !validCache(AP.rates.data)) return "";
    const amount = cents / 100 * AP.rates.data.rates[AP.currency];
    if (!Number.isFinite(amount)) return "";
    return `Approx. ${new Intl.NumberFormat("en-US", { style: "currency", currency: AP.currency }).format(amount)}`;
  };
  function update() {
    document.querySelectorAll("[data-converted-cents]").forEach(element => {
      const text = AP.conversionText(Number(element.dataset.convertedCents));
      element.textContent = text;
      element.hidden = !text;
    });
    const status = document.getElementById("currency-status");
    if (!status) return;
    document.getElementById("currency-choice").value = AP.currency;
    const loading = AP.rates.status === "loading";
    document.getElementById("currency-panel").setAttribute("aria-busy", String(loading));
    const retry = document.getElementById("retry-rates");
    retry.hidden = !["error", "empty"].includes(AP.rates.status);
    retry.disabled = loading;
    status.replaceChildren();
    const message = document.createElement("span");
    if (loading) message.textContent = "Loading exchange rates. USD prices remain available.";
    else if (["error", "empty"].includes(AP.rates.status)) message.textContent = AP.rates.message;
    else if (validCache(AP.rates.data)) message.textContent = `Rates updated ${new Date(AP.rates.data.updated).toLocaleString()}. Conversions are approximate; USD is the base price.`;
    else message.textContent = "Choose KZT or EUR to see approximate prices. All orders are estimated in USD.";
    status.append(message);
    document.dispatchEvent(new CustomEvent("currency:change"));
  }
  AP.rates.load = async () => {
    if (pending) return pending;
    if (validCache(AP.rates.data)) { AP.rates.status = "success"; update(); return AP.rates.data; }
    AP.rates.data = null;
    AP.rates.status = "loading";
    update();
    pending = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error(`Exchange service returned HTTP ${response.status}.`);
        const data = AP.rates.parseRates(await response.json());
        AP.rates.data = data;
        AP.rates.status = data ? "success" : "empty";
        AP.rates.message = data ? "" : "The provider has no KZT/EUR rates available. USD prices remain available.";
        if (data) AP.storage.write(key, data);
        return data;
      } catch (error) {
        AP.rates.status = "error";
        AP.rates.message = `${error.name === "AbortError" ? "The exchange service timed out." : "Exchange rates are unavailable."} USD prices remain available. Retry when connected.`;
        return null;
      } finally {
        clearTimeout(timeout);
        pending = null;
        update();
      }
    })();
    return pending;
  };
  document.addEventListener("DOMContentLoaded", () => {
    const choiceInput = document.getElementById("currency-choice");
    if (!choiceInput) return;
    choiceInput.addEventListener("change", () => {
      AP.currency = choiceInput.value;
      AP.storage.write("autoparts-final-currency-v1", AP.currency);
      update();
      if (AP.currency !== "USD") AP.rates.load();
    });
    document.getElementById("retry-rates").addEventListener("click", () => AP.rates.load());
    document.addEventListener("products:render", update);
    document.addEventListener("store:change", update);
    update();
    if (AP.currency !== "USD") AP.rates.load();
  });
})();

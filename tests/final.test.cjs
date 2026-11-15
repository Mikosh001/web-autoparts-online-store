const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto").webcrypto;

function app(initial = {}, blocked = false, fetcher = async () => { throw new Error("Offline"); }) {
  const saved = new Map(Object.entries(initial));
  const listeners = {};
  const document = {
    addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
    dispatchEvent(event) { for (const handler of listeners[event.type] || []) handler(event); },
    getElementById() { return null; },
    querySelectorAll() { return []; }
  };
  const context = vm.createContext({
    window: { crypto }, document, Intl, Date, setTimeout, clearTimeout, AbortController,
    fetch: (...args) => fetcher(...args),
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem(key) { if (blocked) throw new Error("Denied"); return saved.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error("Denied"); saved.set(key, value); }
    }
  });
  for (const name of ["product", "data", "common", "storage", "cart", "recent", "requests-store", "rates", "forms", "inquiry"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, `../js/${name}.js`), "utf8"), context, { filename: name });
  }
  return { AP: context.window.AutoParts, Product: context.window.Product, saved };
}

function response(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return { result: "success", base_code: "USD", rates: { KZT: 450, EUR: 0.9 }, time_last_update_unix: now - 60, time_next_update_unix: now + 3600, ...overrides };
}

test("Product objects preserve all baseline fields and support catalog search and cent pricing", () => {
  const { AP, Product } = app();
  const original = fs.readFileSync(path.join(__dirname, "../js/data.js"), "utf8");
  assert.ok(original.includes('id: "air"'));
  assert.equal(AP.products.length, 7);
  for (const product of AP.products) {
    assert.ok(product instanceof Product);
    for (const key of ["id", "name", "sku", "category", "price", "image", "rating", "description"]) assert.ok(key in product);
    assert.equal(product.priceInCents(), product.price * 100);
  }
  assert.ok(AP.getProduct("rotor").matches(" BRK-204 ", "Brake Systems"));
  assert.ok(AP.getProduct("rotor").matches("brake systems", "Brake Systems"));
  assert.equal(AP.getProduct("rotor").matches("battery", "Brake Systems"), false);
});

test("recent views sanitize, deduplicate, order, cap at five and restore independently", () => {
  const legacy = JSON.stringify({ cart: [{ id: "air", quantity: 3 }], favorites: ["rotor"], theme: "dark", delivery: "pickup", coupon: "ENDTERM10" });
  const first = app({ "autoparts-endterm-v1": legacy, "autoparts-final-recent-v1": JSON.stringify(["missing", "air", "air", null, "rotor"]) });
  assert.deepEqual([...first.AP.recent.list()], ["air", "rotor"]);
  for (const id of ["shock", "battery", "tire", "mirror", "muffler", "mirror"]) first.AP.recent.add(id);
  assert.deepEqual([...first.AP.recent.list()], ["mirror", "muffler", "tire", "battery", "shock"]);
  first.AP.recent.add("unknown");
  assert.equal(first.AP.recent.list().length, 5);
  const restored = app(Object.fromEntries(first.saved));
  assert.deepEqual([...restored.AP.recent.list()], [...first.AP.recent.list()]);
  restored.AP.recent.clear();
  assert.equal(restored.AP.recent.list().length, 0);
  assert.equal(restored.saved.get("autoparts-endterm-v1"), legacy);
});

test("new persistence recovers from malformed, missing and blocked storage", () => {
  for (const value of ["{bad", "null", "42", '{}']) {
    const { AP } = app({ "autoparts-final-recent-v1": value, "autoparts-final-requests-v1": value, "autoparts-final-rates-v1": value });
    assert.equal(AP.recent.list().length, 0);
    assert.equal(AP.requests.list().length, 0);
    assert.equal(AP.rates.data, null);
  }
  const { AP } = app({}, true);
  AP.recent.add("air");
  AP.requests.create({ productId: "air", quantity: 2, note: "", status: "draft" });
  assert.equal(AP.recent.list()[0], "air");
  assert.equal(AP.requests.list().length, 1);
  assert.equal(AP.storage.failed, true);
});

test("saved requests implement multiple-record CRUD with stable IDs and creation dates", () => {
  const { AP, saved } = app();
  const first = AP.requests.create({ productId: "air", quantity: 2, note: " Check fitment ", status: "draft" });
  const second = AP.requests.create({ productId: "rotor", quantity: 1, note: "", status: "ready" });
  assert.notEqual(first.id, second.id);
  AP.requests.update(first.id, { productId: "tire", quantity: 99, note: "Updated", status: "sent" });
  const updated = AP.requests.list().find(record => record.id === first.id);
  assert.equal(updated.createdAt, first.createdAt);
  assert.equal(updated.quantity, 99);
  assert.equal(updated.status, "sent");
  const restored = app(Object.fromEntries(saved));
  assert.equal(restored.AP.requests.list().length, 2);
  restored.AP.requests.remove(second.id);
  assert.equal(restored.AP.requests.list().length, 1);
  assert.equal(restored.AP.requests.list()[0].id, first.id);
});

test("request validation rejects invalid quantities, IDs, notes, statuses and corrupt records", () => {
  const { AP } = app();
  const valid = { productId: "air", quantity: 1, note: "<img src=x>", status: "draft" };
  for (const quantity of [0, 100, 1.5, "2", NaN]) assert.throws(() => AP.requests.create({ ...valid, quantity }));
  for (const value of [{ ...valid, productId: "missing" }, { ...valid, note: "x".repeat(201) }, { ...valid, status: "unknown" }]) assert.throws(() => AP.requests.create(value));
  const record = AP.requests.create(valid);
  const sanitized = AP.requests.sanitize([record, record, { ...record, id: "other", productId: "missing" }, { ...record, id: "bad-date", createdAt: "invalid" }, null]);
  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].note, "<img src=x>");
  assert.throws(() => AP.requests.update("missing", valid));
});

test("API parsing validates provider result, USD base, rate types and update times", () => {
  const { AP } = app();
  const valid = AP.rates.parseRates(response());
  assert.deepEqual(Object.keys(valid.rates), ["KZT", "EUR"]);
  assert.ok(AP.rates.validCache(valid));
  assert.equal(AP.rates.parseRates(response({ rates: {} })), null);
  assert.equal(AP.rates.parseRates(response({ rates: { EUR: 1 } })), null);
  for (const overrides of [{ result: "error" }, { base_code: "EUR" }, { rates: { KZT: 0, EUR: 1 } }, { rates: { KZT: "450", EUR: 1 } }, { rates: { KZT: Infinity, EUR: 1 } }, { time_next_update_unix: 1 }]) assert.throws(() => AP.rates.parseRates(response(overrides)));
  assert.equal(AP.rates.validCache({ ...valid, expires: Date.now() - 1 }), false);
  assert.equal(AP.rates.validCache({ ...valid, expires: valid.fetched + 86400001 }), false);
});

test("API uses cache, shares an in-flight request and converts without changing USD totals", async () => {
  let calls = 0;
  const { AP, saved } = app({}, false, async () => { calls += 1; return { ok: true, json: async () => response() }; });
  await Promise.all([AP.rates.load(), AP.rates.load()]);
  assert.equal(calls, 1);
  assert.equal(AP.rates.status, "success");
  AP.state.cart = [{ id: "air", quantity: 3 }, { id: "rotor", quantity: 1 }];
  AP.state.coupon = "ENDTERM10";
  AP.currency = "KZT";
  assert.match(AP.conversionText(AP.quote().total), /Approx\./);
  assert.equal(AP.quote().total, 30660);
  const restored = app(Object.fromEntries(saved), false, async () => { throw new Error("Cache should avoid network"); });
  await restored.AP.rates.load();
  assert.equal(restored.AP.rates.status, "success");
});

test("API handles HTTP, JSON, network and empty failures, then permits retry", async () => {
  for (const fetcher of [async () => ({ ok: false, status: 503 }), async () => ({ ok: true, json: async () => { throw new Error("JSON"); } }), async () => { throw new Error("Network"); }, async () => ({ ok: true, json: async () => response({ rates: {} }) })]) {
    const { AP } = app({}, false, fetcher);
    await AP.rates.load();
    assert.ok(["error", "empty"].includes(AP.rates.status));
    assert.equal(AP.conversionText(4500), "");
    assert.equal(AP.money(45), "$45.00");
  }
  let calls = 0;
  const { AP } = app({}, false, async () => { calls += 1; if (calls === 1) throw new Error("Offline"); return { ok: true, json: async () => response() }; });
  await AP.rates.load();
  await AP.rates.load();
  assert.equal(calls, 2);
  assert.equal(AP.rates.status, "success");
});

test("expired cache is refreshed and blocked cache writes leave live conversion usable", async () => {
  const first = app();
  const expired = { ...first.AP.rates.parseRates(response()), expires: Date.now() - 1000 };
  let calls = 0;
  const fetcher = async () => { calls += 1; return { ok: true, json: async () => response() }; };
  const stale = app({ "autoparts-final-rates-v1": JSON.stringify(expired) }, false, fetcher);
  assert.equal(stale.AP.rates.data, null);
  await stale.AP.rates.load();
  assert.equal(calls, 1);
  const denied = app({}, true, fetcher);
  await denied.AP.rates.load();
  denied.AP.currency = "EUR";
  assert.match(denied.AP.conversionText(4500), /40\.50/);
});

test("inquiry text uses the shared quote and excludes pickup address data", () => {
  const { AP } = app();
  assert.ok(AP.inquiry.cartError());
  AP.state.cart = [{ id: "air", quantity: 3 }, { id: "rotor", quantity: 1 }];
  AP.state.coupon = "ENDTERM10";
  assert.equal(AP.inquiry.cartError(), "");
  const values = { name: "Sample Student", email: "sample@example.com", vehicle: "2020 Sedan", address: "123 Test Street, Astana", message: "Check fitment" };
  assert.match(AP.inquiry.text(values), /Estimated total: \$306\.60/);
  assert.match(AP.inquiry.text(values), /Delivery address: 123 Test Street/);
  AP.state.delivery = "pickup";
  const pickup = AP.inquiry.text(values);
  assert.match(pickup, /Estimated total: \$291\.60/);
  assert.ok(!pickup.includes(values.address));
  AP.state.cart[0].quantity = 0;
  assert.ok(AP.inquiry.cartError());
});

test("shared form validation supports required, email, phone, length and disabled address", () => {
  const { AP } = app();
  const base = { value: "", required: true, type: "text", dataset: {}, maxLength: 100, tagName: "INPUT" };
  assert.ok(AP.forms.validateField(base));
  assert.equal(AP.forms.validateField({ ...base, disabled: true }), "");
  assert.ok(AP.forms.validateField({ ...base, type: "email", value: "bad-email" }));
  assert.equal(AP.forms.validateField({ ...base, type: "email", value: "sample@example.com" }), "");
  assert.ok(AP.forms.validateField({ ...base, type: "tel", value: "123" }));
  assert.equal(AP.forms.validateField({ ...base, type: "tel", value: "+7 777 123 4567" }), "");
  assert.ok(AP.forms.validateField({ ...base, value: "short", dataset: { min: "10" } }));
});

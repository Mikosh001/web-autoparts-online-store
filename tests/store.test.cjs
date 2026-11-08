// Core state and cart tests use Node's built-in runner; UI checks are in README.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStore(savedValue = null, blocked = false) {
  const listeners = {};
  let stored = savedValue;
  const document = {
    addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
    dispatchEvent(event) { for (const handler of listeners[event.type] || []) handler(event); },
    getElementById() { return null; },
    querySelector() { return null; }
  };
  const context = vm.createContext({
    window: {}, document, Intl, setTimeout, clearTimeout,
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem() { if (blocked) throw new Error("Storage denied"); return stored; },
      setItem(key, value) { if (blocked) throw new Error("Storage denied"); stored = value; }
    }
  });
  for (const file of ["data.js", "common.js", "cart.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../js", file), "utf8"), context, { filename: file });
  }
  // Initialize the cart module without constructing a browser UI.
  listeners.DOMContentLoaded[1]();
  return {
    AP: context.window.AutoParts,
    getStored: () => stored,
    click(action, id) {
      document.dispatchEvent({ type: "click", target: { closest(selector) {
        return selector === `[data-${action}]` ? { dataset: { [action]: id } } : null;
      } } });
    }
  };
}

test("catalog contains seven unique products with valid category links and positive prices", () => {
  const { AP } = createStore();
  assert.equal(AP.products.length, 7);
  assert.equal(new Set(AP.products.map(product => product.id)).size, 7);
  assert.equal(AP.categories.length, 7);
  for (const product of AP.products) {
    assert.ok(product.price > 0);
    assert.ok(AP.categories.some(category => category.id === product.category));
  }
});

test("missing, invalid JSON and unavailable browser storage recover to an empty cart", () => {
  for (const saved of [null, "{broken", "null", "42"]) {
    const { AP } = createStore(saved);
    assert.equal(AP.state.cart.length, 0);
    assert.equal(AP.state.favorites.length, 0);
    assert.equal(AP.cartTotal(), 0);
  }
  const { AP } = createStore(null, true);
  AP.toggleFavorite("air");
  assert.equal(AP.state.favorites[0], "air");
});

test("saved cart rejects unknown IDs, duplicates, fractions and out-of-range quantities", () => {
  const { AP } = createStore(JSON.stringify({ cart: [
    { id: "air", quantity: 3 }, { id: "air", quantity: 5 },
    { id: "rotor", quantity: 0 }, { id: "shock", quantity: 100 },
    { id: "tire", quantity: 1.5 }, { id: "battery", quantity: "2" },
    { id: "unknown", quantity: 1 }, null, { id: "mirror", quantity: 99 }
  ], favorites: ["air", "air", "unknown", null], theme: "unexpected" }));
  assert.deepEqual(JSON.parse(JSON.stringify(AP.state.cart)), [{ id: "air", quantity: 3 }, { id: "mirror", quantity: 99 }]);
  assert.deepEqual([...AP.state.favorites], ["air"]);
  assert.equal(AP.state.theme, "light");
});

test("adding a product merges quantities and totals come from catalog prices", () => {
  const store = createStore();
  store.click("add", "air");
  store.click("add", "air");
  store.click("add", "rotor");
  assert.equal(store.AP.state.cart.length, 2);
  assert.equal(store.AP.state.cart[0].quantity, 2);
  assert.equal(store.AP.cartTotal(), 279);
  assert.equal(JSON.parse(store.getStored()).cart[0].quantity, 2);
  store.click("remove", "rotor");
  assert.equal(store.AP.cartTotal(), 90);
});

test("maximum quantity remains 99 and unknown products cannot be added", () => {
  const store = createStore(JSON.stringify({ cart: [{ id: "air", quantity: 99 }] }));
  store.click("add", "air");
  store.click("add", "unknown");
  assert.equal(store.AP.state.cart.length, 1);
  assert.equal(store.AP.state.cart[0].quantity, 99);
});

test("favorite toggling persists valid IDs and leaves the cart unchanged", () => {
  const store = createStore();
  store.AP.toggleFavorite("air");
  assert.deepEqual([...store.AP.state.favorites], ["air"]);
  assert.equal(store.AP.state.cart.length, 0);
  store.AP.toggleFavorite("air");
  store.AP.toggleFavorite("unknown");
  assert.equal(store.AP.state.favorites.length, 0);
});

test("currency and HTML escaping produce safe reusable card content", () => {
  const { AP } = createStore();
  assert.equal(AP.money(135), "$135.00");
  assert.equal(AP.escapeHTML('<img title="x"> & \'y\''), "&lt;img title=&quot;x&quot;&gt; &amp; &#39;y&#39;");
  const card = AP.productCard({ ...AP.products[0], name: '<script>alert("x")</script>' });
  assert.ok(card.includes("&lt;script&gt;"));
  assert.ok(!card.includes("<script>"));
});

test("quantity changes reject invalid values and keep product totals consistent", () => {
  const { AP } = createStore();
  AP.addToCart("air");
  for (const value of [0, 100, 1.5, "3", NaN]) assert.equal(AP.setQuantity("air", value), false);
  assert.equal(AP.setQuantity("unknown", 2), false);
  assert.equal(AP.setQuantity("air", 3), true);
  assert.equal(AP.cartTotal(), 135);
});

test("delivery and discount use integer cents, including the free-delivery threshold", () => {
  const { AP } = createStore();
  assert.equal(AP.getCartQuote([]).total, 0);
  const cart = [{ id: "air", quantity: 3 }, { id: "rotor", quantity: 1 }];
  assert.equal(AP.getCartQuote(cart).subtotal, 32400);
  assert.equal(AP.getCartQuote(cart).shipping, 0);
  const discounted = AP.getCartQuote(cart, "standard", "ENDTERM10");
  assert.equal(discounted.discount, 3240);
  assert.equal(discounted.freeShippingRemaining, 840);
  assert.equal(discounted.shipping, 1500);
  assert.equal(discounted.total, 30660);
  assert.equal(AP.getCartQuote(cart, "pickup", "ENDTERM10").total, 29160);
  assert.equal(AP.getCartQuote(cart, "express", "ENDTERM10").total, 32160);
  assert.equal(AP.getCartQuote(cart, "standard", "INVALID").discount, 0);
});

function createAuth(accounts = null, savedSession = null) {
  let local = accounts;
  let session = savedSession;
  const context = vm.createContext({
    window: { AutoParts: {}, crypto: require("node:crypto").webcrypto },
    TextEncoder, Uint8Array, Date,
    document: { addEventListener() {}, dispatchEvent() {} },
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: { getItem: () => local, setItem: (key, value) => { local = value; } },
    sessionStorage: { getItem: () => session, setItem: (key, value) => { session = value; }, removeItem: () => { session = null; } }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/auth.js"), "utf8"), context);
  return { auth: context.window.AutoParts.auth, local: () => local, session: () => session };
}

test("demo login rejects wrong credentials and logout clears the session", async () => {
  const { auth, session } = createAuth();
  await assert.rejects(auth.login("student@autoparts.demo", "wrong-password"), /incorrect/);
  await auth.login(" STUDENT@AUTOPARTS.DEMO ", "AutoParts123!");
  assert.equal(auth.user().name, "Demo Student");
  assert.ok(!session().includes("AutoParts123!"));
  auth.logout();
  assert.equal(auth.user(), null);
  assert.equal(session(), null);
});

test("registration hashes passwords with unique salts and supports a later login", async () => {
  const first = createAuth();
  await first.auth.register(" Sample Student ", " SAMPLE@example.com ", "SamplePassword123");
  await first.auth.register("Another Student", "another@example.com", "SamplePassword123");
  const accounts = JSON.parse(first.local());
  assert.equal(accounts[0].name, "Sample Student");
  assert.equal(accounts[0].email, "sample@example.com");
  assert.match(accounts[0].salt, /^[a-f0-9]{32}$/);
  assert.match(accounts[0].digest, /^[a-f0-9]{64}$/);
  assert.notEqual(accounts[0].salt, accounts[1].salt);
  assert.notEqual(accounts[0].digest, accounts[1].digest);
  assert.ok(!first.local().includes("SamplePassword123"));
  await assert.rejects(first.auth.register("Duplicate", "sample@example.com", "SamplePassword123"), /already/);
  const later = createAuth(first.local());
  await assert.rejects(later.auth.login("sample@example.com", "IncorrectPassword"), /incorrect/);
  await later.auth.login("sample@example.com", "SamplePassword123");
  assert.equal(later.auth.user().name, "Sample Student");
});

test("expired sessions and malformed saved accounts are ignored", async () => {
  const { auth } = createAuth('[{"name":"Broken"}]', JSON.stringify({ name: "Student", email: "demo@example.com", expires: 1 }));
  assert.equal(auth.user(), null);
  assert.ok(auth.emailError("bad-address"));
  assert.ok(auth.passwordError("short"));
  await assert.rejects(auth.register("X", "demo@example.com", "LongPassword"), /name/);
  await assert.rejects(auth.register("Student", "demo@example.com", "short"), /password/);
});

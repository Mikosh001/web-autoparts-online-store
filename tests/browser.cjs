const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");

const base = process.env.AUTOPARTS_URL || "http://127.0.0.1:4173/web-autoparts-online-store/";
const evidence = process.env.AUTOPARTS_EVIDENCE || path.join(os.tmpdir(), "autoparts-final-evidence");
const browserPath = process.env.AUTOPARTS_BROWSER || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined);
const endpoint = "**/open.er-api.com/v6/latest/USD";
const report = { base, checks: [], responsive: [], errors: [], liveAPI: null };
function check(name) { report.checks.push(name); console.log(`PASS ${name}`); }

async function run() {
  await fs.mkdir(evidence, { recursive: true });
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  report.browser = await browser.version();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") report.errors.push(message.text()); });
    page.on("response", response => { if (response.url().startsWith(base) && response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    const go = file => page.goto(base + file, { waitUntil: "networkidle" });

    await go("index.html");
    await page.locator("#home-search").fill("rotor");
    await page.locator("#quick-search").evaluate(form => form.requestSubmit());
    await page.waitForURL("**/products.html?q=rotor");
    assert.equal(await page.locator("#product-grid .product-card").count(), 1);
    await go("categories.html");
    await page.locator("#category-search").fill("brake");
    assert.equal(await page.locator("#category-grid .category-card").count(), 1);
    await page.locator("#category-grid a").click();
    await page.waitForURL("**/products.html?category=brakes");
    assert.match(await page.locator("#product-grid").innerText(), /Front Brake Rotor/);
    check("Home and category search navigate to filtered real catalog data");

    await page.locator("#reset-filters").click();
    await page.locator('input[name="category"][value="engine"]').check();
    await page.locator('input[name="price"][value="high"]').check();
    assert.equal(await page.locator("#catalog-empty").isVisible(), true);
    await page.locator("#empty-reset").click();
    assert.equal(await page.locator("#product-grid .product-card").count(), 7);
    await page.locator("#sort-products").selectOption("price-asc");
    assert.equal(await page.locator("#product-grid .product-card").first().getAttribute("id"), "product-air");
    await page.locator("#product-search").fill("BRK-204");
    assert.equal(await page.locator("#comparison-body tr").count(), 1);
    await page.locator("#reset-filters").click();
    await page.locator('[data-favorite="air"]').click();
    await page.locator("#favorites-only").check();
    assert.equal(await page.locator("#product-grid .product-card").count(), 1);
    await page.locator('[data-favorite="air"]').click();
    assert.equal(await page.locator("#catalog-empty").isVisible(), true);
    await page.locator("#reset-filters").click();
    check("Filter, sort, empty/reset, favorites and comparison retain endterm behavior");

    await page.locator('[data-details="air"]').click();
    await page.locator('[data-details="air"]').click();
    await page.locator('[data-details="air"]').click();
    assert.equal(await page.locator("#recent-products li").count(), 1);
    for (const id of ["rotor", "shock", "battery", "tire", "mirror", "muffler"]) await page.locator(`[data-details="${id}"]`).click();
    assert.equal(await page.locator("#recent-products li").count(), 5);
    await page.reload({ waitUntil: "networkidle" });
    assert.match(await page.locator("#recent-products li").first().innerText(), /Muffler/);
    const oldState = await page.evaluate(() => localStorage.getItem("autoparts-endterm-v1"));
    await page.locator("#clear-recent").click();
    assert.equal(await page.locator("#recent-products li").count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem("autoparts-endterm-v1")), oldState);
    check("Part details records one recent view per opening; order, cap, reload and isolated clear work");

    await page.locator("#reset-filters").click();
    for (let count = 0; count < 3; count += 1) await page.locator('[data-add="air"]').click();
    await page.locator('[data-add="rotor"]').click();
    await go("cart.html");
    await page.locator("#coupon-code").fill("bad");
    await page.locator("#coupon-form button[type=submit]").click();
    assert.notEqual(await page.locator("#coupon-code-error").innerText(), "");
    await page.locator("#coupon-code").fill("ENDTERM10");
    await page.locator("#coupon-form button[type=submit]").click();
    assert.equal(await page.locator("#cart-total").innerText(), "$306.60");
    await page.locator("#quantity-air").fill("0");
    await page.locator("#quantity-air").dispatchEvent("change");
    assert.equal(await page.locator("#quantity-air").inputValue(), "3");
    await page.locator('[data-save-later="rotor"]').click();
    assert.equal(await page.locator("#cart-items .cart-row").count(), 1);
    await page.locator("#undo-remove").click();
    await page.locator('[data-remove="rotor"]').click();
    await page.locator("#undo-remove").click();
    await page.locator("#clear-cart").click();
    assert.equal(await page.locator("#empty-cart").isVisible(), true);
    await page.locator("#undo-remove").click();
    assert.equal(await page.locator("#cart-total").innerText(), "$306.60");
    check("Cart quantity rejection, save for later, remove/clear undo and $306.60 arithmetic pass");

    await page.locator("#inquiry-next").click();
    await page.locator("#inquiry-next").click();
    assert.equal(await page.locator("#order-name").evaluate(el => document.activeElement === el), true);
    await page.locator("#order-name").fill("Sample Student");
    await page.locator("#order-email").fill("bad-email");
    await page.locator("#order-vehicle").fill("2020 Test Sedan");
    await page.locator("#inquiry-next").click();
    assert.equal(await page.locator("#order-email").getAttribute("aria-invalid"), "true");
    await page.locator("#order-email").fill("sample@example.com");
    await page.locator("#inquiry-next").click();
    assert.equal(await page.locator("#order-address").getAttribute("aria-invalid"), "true");
    await page.locator("#order-address").fill("123 Test Street, Astana 010000");
    await page.locator("#inquiry-next").click();
    await page.locator("#inquiry-back").click();
    assert.equal(await page.locator("#order-name").inputValue(), "Sample Student");
    await page.locator("#inquiry-next").click();
    await page.locator("#inquiry-prepare").click();
    assert.equal(await page.locator("#order-consent").getAttribute("aria-invalid"), "true");
    await page.locator("#order-consent").check();
    await page.locator("#inquiry-prepare").click();
    const preview = await page.locator("#inquiry-review").innerText();
    const downloadEvent = page.waitForEvent("download");
    await page.locator('#order-form a[download]').click();
    const download = await downloadEvent;
    const file = await download.path();
    assert.equal(await fs.readFile(file, "utf8"), preview);
    assert.match(preview, /Estimated total: \$306\.60/);
    await page.locator("#delivery-method").selectOption("pickup");
    assert.equal(await page.locator('#order-form a[download]').count(), 0);
    assert.ok(!(await page.locator("#inquiry-review").innerText()).includes("123 Test Street"));
    await page.locator("#inquiry-prepare").click();
    await page.locator("#quantity-air").fill("4");
    await page.locator("#quantity-air").dispatchEvent("change");
    assert.equal(await page.locator('#order-form a[download]').count(), 0);
    await page.locator("#quantity-air").fill("3");
    await page.locator("#quantity-air").dispatchEvent("change");
    await page.locator("#delivery-method").selectOption("express");
    assert.match(await page.locator("#inquiry-review").innerText(), /Estimated total: \$321\.60/);
    check("Three-step form validates/focuses, retains Back input, matches downloaded text and invalidates stale files");
    check("Pickup omits retained address; Standard/Express require it and use shared totals");

    await go("requests.html");
    await page.locator("#save-request").click();
    assert.equal(await page.locator("#request-product").getAttribute("aria-invalid"), "true");
    await page.locator("#request-product").selectOption("air");
    await page.locator("#request-quantity").fill("100");
    await page.locator("#save-request").click();
    assert.equal(await page.locator("#request-quantity").getAttribute("aria-invalid"), "true");
    await page.locator("#request-quantity").fill("2");
    await page.locator("#request-note").fill('<img src=x onerror="alert(1)">');
    await page.locator("#save-request").click();
    assert.equal(await page.locator("#request-list img").count(), 0);
    assert.match(await page.locator("#request-list").innerText(), /<img src=x/);
    await page.locator("#request-product").selectOption("rotor");
    await page.locator("#save-request").click();
    assert.equal(await page.locator(".request-card").count(), 2);
    await page.locator('[data-action="edit"]').first().click();
    await page.locator("#request-quantity").fill("9");
    await page.locator("#cancel-request").click();
    assert.match(await page.locator(".request-card").first().innerText(), /Quantity: 1/);
    const originalId = await page.locator('[data-action="edit"]').first().getAttribute("data-id");
    await page.locator('[data-action="edit"]').first().click();
    await page.locator("#request-quantity").fill("99");
    await page.locator("#request-status").selectOption("ready");
    await page.locator("#save-request").click();
    assert.equal(await page.locator('[data-action="edit"]').first().getAttribute("data-id"), originalId);
    await page.reload({ waitUntil: "networkidle" });
    assert.match(await page.locator(".request-card").first().innerText(), /Quantity: 99 · Status: ready/);
    await page.locator('[data-action="delete"]').first().click();
    assert.equal(await page.locator(".request-card").count(), 1);
    check("Request CRUD validates inputs, renders hostile text safely, supports cancel and preserves edits on reload");

    await go("contact.html");
    await page.locator('#contact-form button[type="submit"]').click();
    assert.equal(await page.locator("#fullName").getAttribute("aria-invalid"), "true");
    await page.locator("#fullName").fill("Sample Student");
    await page.locator("#email").fill("sample@example.com");
    await page.locator("#phone").fill("123");
    await page.locator("#topic").selectOption("fitment");
    await page.locator("#message").fill("Please check fitment for my test vehicle.");
    await page.locator("#consent").check();
    await page.locator('#contact-form button[type="submit"]').click();
    assert.equal(await page.locator("#phone").getAttribute("aria-invalid"), "true");
    await page.locator("#phone").fill("");
    await page.locator('#contact-form button[type="submit"]').click();
    assert.equal(await page.locator('#contact-form a[download]').count(), 1);
    const contactDownload = page.waitForEvent("download");
    await page.locator('#contact-form a[download]').click();
    const contactFile = await (await contactDownload).path();
    assert.match(await fs.readFile(contactFile, "utf8"), /Please check fitment for my test vehicle/);
    await page.locator('#contact-form button[type="reset"]').click();
    assert.equal(await page.locator('#contact-form a[download]').count(), 0);
    check("Contact validation, optional phone, inquiry download and reset remain operational");

    await go("login.html");
    await page.locator("#fill-demo").click();
    await page.locator('#login-form button[type="submit"]').click();
    await page.locator("#profile-heading").waitFor({ state: "visible" });
    await go("cart.html");
    assert.equal(await page.locator("#order-name").inputValue(), "Demo Student");
    await go("login.html");
    await page.locator("#logout-button").click();
    await page.locator('[data-auth-tab="register"]').click();
    await page.locator("#register-name").fill("Sample Student");
    await page.locator("#register-email").fill("browser-test@example.com");
    await page.locator("#register-password").fill("TestPassword123!");
    await page.locator("#register-confirm").fill("DifferentPassword123!");
    await page.locator('#register-form button[type="submit"]').click();
    assert.equal(await page.locator("#register-confirm").getAttribute("aria-invalid"), "true");
    await page.locator("#register-confirm").fill("TestPassword123!");
    await page.locator('#register-form button[type="submit"]').click();
    await page.locator("#profile-heading").waitFor({ state: "visible" });
    await page.locator("#logout-button").click();
    await page.locator("#login-email").fill("browser-test@example.com");
    await page.locator("#login-password").fill("TestPassword123!");
    await page.locator('#login-form button[type="submit"]').click();
    await page.locator("#profile-heading").waitFor({ state: "visible" });
    check("Demo login, registration/mismatch validation, hashed saved-account login, logout and autofill pass");

    await go("about.html");
    await page.locator(".faq-question").nth(0).click();
    await page.locator(".faq-question").nth(1).click();
    assert.equal(await page.locator(".faq-question").nth(0).getAttribute("aria-expanded"), "false");
    await page.locator("#faq-search").fill("zzzz");
    assert.equal(await page.locator("#faq-empty").isVisible(), true);
    await page.locator("#faq-search").fill("");
    check("jQuery FAQ accordion and search retain their behavior");

    await go("products.html");
    await page.locator("#currency-choice").selectOption("KZT");
    await page.waitForFunction(() => ["success", "error", "empty"].includes(window.AutoParts.rates.status), { timeout: 15000 });
    report.liveAPI = await page.evaluate(() => ({ status: AutoParts.rates.status, updated: AutoParts.rates.data?.updated, rates: AutoParts.rates.data?.rates, text: document.getElementById("currency-status").textContent }));
    assert.equal(report.liveAPI.status, "success", JSON.stringify(report.liveAPI));
    assert.match(await page.locator("#product-air .converted-price").innerText(), /Approx/);
    check("Live external API works from the browser with CORS, attribution and approximate price output");
    await page.locator("#currency-choice").selectOption("USD");

    const pages = ["index", "categories", "products", "cart", "login", "about", "contact", "requests"];
    for (const theme of ["light", "dark"]) {
      for (const width of [360, 390, 768, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const name of pages) {
          await go(`${name}.html`);
          await page.evaluate(theme => { AutoParts.state.theme = theme; AutoParts.saveState(); document.documentElement.dataset.theme = theme; }, theme);
          await page.evaluate(() => document.fonts.ready);
          const overflow = await page.evaluate(() => ({ viewport: innerWidth, actual: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
          assert.ok(overflow.actual <= width + 1, `${name} ${theme} ${width}: overflow ${overflow.actual}`);
          report.responsive.push({ page: name, theme, width, height: 900, overflow: false });
          if ([390, 1440].includes(width) && ["products", "cart", "about", "contact", "requests"].includes(name)) await page.screenshot({ path: path.join(evidence, `${name}-${theme}-${width}.png`), fullPage: true });
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await go("index.html");
    await page.locator(".mobile-nav summary").click();
    assert.equal(await page.locator(".mobile-nav").getAttribute("open"), "");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".mobile-nav").getAttribute("open"), null);
    check("All eight pages pass 80 responsive/theme cases; mobile menu opens and Escape closes it");
    assert.deepEqual(report.errors, []);
    check("Normal browser flows have no unhandled JavaScript or console/resource errors");
    await context.close();

    const denied = await browser.newContext();
    await denied.addInitScript(() => {
      Storage.prototype.getItem = function () { throw new DOMException("Denied", "SecurityError"); };
      Storage.prototype.setItem = function () { throw new DOMException("Denied", "SecurityError"); };
    });
    const deniedPage = await denied.newPage();
    await deniedPage.goto(base + "requests.html");
    await deniedPage.locator("#request-product").selectOption("air");
    await deniedPage.locator("#save-request").click();
    assert.equal(await deniedPage.locator(".request-card").count(), 1);
    assert.equal(await deniedPage.locator("#requests-storage").isVisible(), true);
    await denied.close();
    check("Blocked browser storage keeps request CRUD usable for the current page and shows its limitation");

    for (const kind of ["http", "json", "network", "empty", "retry", "cache", "expired"]) {
      const isolated = await browser.newContext();
      let calls = 0;
      const now = Date.now();
      const fixture = { result: "success", base_code: "USD", rates: { KZT: 450, EUR: 0.9 }, time_last_update_unix: Math.floor(now / 1000) - 60, time_next_update_unix: Math.floor(now / 1000) + 3600 };
      if (["cache", "expired"].includes(kind)) await isolated.addInitScript(({ now, kind }) => {
        localStorage.setItem("autoparts-final-rates-v1", JSON.stringify({ base: "USD", rates: { KZT: 450, EUR: 0.9 }, updated: now - 60000, fetched: now - 2000, expires: kind === "expired" ? now - 1000 : now + 300000 }));
        localStorage.setItem("autoparts-final-currency-v1", JSON.stringify("KZT"));
      }, { now, kind });
      await isolated.route(endpoint, async route => {
        calls += 1;
        if (kind === "network") return route.abort();
        if (kind === "http" || (kind === "retry" && calls === 1)) return route.fulfill({ status: 503, body: "Unavailable" });
        if (kind === "json") return route.fulfill({ contentType: "application/json", body: "{broken" });
        return route.fulfill({ contentType: "application/json", body: JSON.stringify(kind === "empty" ? { ...fixture, rates: {} } : fixture) });
      });
      const testPage = await isolated.newPage();
      await testPage.goto(base + "products.html");
      await testPage.locator("#currency-choice").selectOption("KZT");
      await testPage.waitForFunction(() => AutoParts.rates.status !== "loading");
      if (["http", "json", "network", "empty", "retry"].includes(kind)) {
        assert.equal(await testPage.locator("#retry-rates").isVisible(), true, kind);
        assert.equal(await testPage.locator("#product-grid .product-card").count(), 7);
        assert.match(await testPage.locator("#product-air .price").innerText(), /45/);
      }
      if (kind === "retry") {
        await testPage.locator("#retry-rates").click();
        await testPage.waitForFunction(() => AutoParts.rates.status === "success");
        assert.equal(calls, 2);
      }
      if (kind === "cache") assert.equal(calls, 0);
      if (kind === "expired") assert.equal(calls, 1);
      await isolated.close();
    }
    check("Browser API HTTP/JSON/network/empty/retry, fresh cache and expired cache states pass with test-only fixtures");
  } finally {
    await browser.close();
    await fs.writeFile(path.join(evidence, "browser-report.json"), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ checks: report.checks.length, responsive: report.responsive.length, browser: report.browser, evidence }, null, 2));
}
run().catch(error => { console.error(error); process.exitCode = 1; });

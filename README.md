# AutoParts Online Store

Responsive client-side auto-parts store continuing our midterm and endterm.
HTML, CSS, Bootstrap 5.3.8, JavaScript and jQuery 3.7.1; no build step.

## Team

- Meirbek Berdibek (@Mikosh001): Product OOP, catalog compatibility, recent views, Home/Categories/About and jQuery integration.
- Beimzhan Otegen (@PactusOs): exchange-rate API, saved-request CRUD, Products/Cart presentation and product assets.
- Aslan Sabyr (@asikxz008): three-step inquiry, validation, Login/Contact compatibility, shared design, documentation and release checks.
- Exact ownership of changed and deleted files: [team handoff](docs/TEAM_HANDOFF.md).

## Final additions

1. API: approximate KZT/EUR product prices and cart totals alongside USD.
2. OOP: seven Product objects provide real catalog search and cent pricing.
3. Storage: up to five recently viewed parts, restored and clearable independently.
4. CRUD: create, read, edit, cancel and delete local part requests.
5. Advanced form: parts, customer/delivery details and final inquiry review.

Search, filters, sorting, favorites, comparison, cart quantities/undo/save-for-later,
ENDTERM10, delivery estimates, themes, demo accounts and jQuery effects are retained.

## Run and test

Run with Node.js: `node tools/serve.mjs`, then open http://127.0.0.1:4173/.
Tests: `node --test tests/store.test.cjs tests/final.test.cjs tests/structure.cjs`.

## API and local data

Endpoint: https://open.er-api.com/v6/latest/USD (no key).
[Rates By Exchange Rate API](https://www.exchangerate-api.com); [provider terms](https://www.exchangerate-api.com/docs/free).
Only KZT/EUR rates and update metadata are cached until the next update or 24 hours.
Choose KZT/EUR on Home, Products or Cart; failures show retry and retain USD prices.
Original totals use integer USD cents; conversion is approximate and not a payment quote.
Requests, recent views and settings stay in this browser; blocked storage uses page memory.
Inquiry downloads are text files to email yourself. No message or payment is sent automatically.
Demo: `student@autoparts.demo` / `AutoParts123!`; use sample registration details.
Local demo accounts retain the existing salted PBKDF2 helper; they are not server authentication.
Cart and favorites are shared by guest and demo accounts in the same browser.

## Repository and publication

Repository: https://github.com/Mikosh001/web-autoparts-online-store
Live site: https://mikosh001.github.io/web-autoparts-online-store/
GitHub Pages deployment and all eight pages verified on 16 November 2026.
See [feature map](docs/REQUIREMENTS.md), [checks](docs/FINAL_CHECKS.md) and [defence notes](docs/DEFENCE_RU.md).

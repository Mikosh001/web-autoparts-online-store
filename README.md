# AutoParts Online Store

Endterm continuation of our WEB Technologies midterm. The original five responsive pages, group, Bootstrap styles, orange and charcoal design, product images and navigation are retained. Two new pages provide a dedicated cart and demo account login/registration. JavaScript and jQuery power the catalog, favorites, forms and FAQ.

## Pages

- `index.html` — quick search, dynamic featured products, favorites, cart actions and part details.
- `categories.html` — live category search and links to a filtered catalog.
- `products.html` — search, combined category/price filters, sorting, favorites view, add-to-cart actions and dynamic comparison.
- `cart.html` — dedicated cart, +/− quantity controls, save for later, undo removal/clear, promo code, delivery options, estimated totals and order inquiry.
- `login.html` — demo login, registration, password visibility, account profile, logout and inquiry autofill.
- `about.html` — original store content plus searchable jQuery FAQ accordion.
- `contact.html` — custom validation of name, email, optional phone, topic, message and confirmation.
- All pages — persistent cart, favorites, light/dark theme, cart count, action feedback and keyboard-friendly mobile navigation.

## Team

- Meirbek Berdibek (@Mikosh001) — Home, Categories, About, catalog data, jQuery FAQ/details and related assets. Main code: `index.html`, `categories.html`, `about.html`, `js/data.js`, `js/home.js`, `js/categories.js`, `js/jquery-ui.js`. **15 files total.**
- Beimzhan Otegen — Products, Cart, shared browser state/theme/card template, catalog filters, delivery/discount calculations, tests and preview server. Main code: `products.html`, `cart.html`, `js/catalog.js`, `js/cart.js`, `js/common.js`. **15 files total.**
- Aslan Sabyr (@asikxz008) — Login/registration, Contact, form validation, account/base/footer styles, font configuration and team documentation. Main code: `login.html`, `contact.html`, `js/auth.js`, `js/forms.js`, `css/account.css`, `css/base-footer.css`. **15 files total.**

All 45 changed/new files are assigned exactly once, 15 to each member. Shared styles, dependencies and documentation are included in the split; copying all three parts preserves the complete working project. Exact paths are listed in [the upload guide](docs/UPLOAD_RU.md).

This is the planned responsibility split for reviewing, adapting, testing and presenting the endterm work. Each member should understand their files before committing them; all members must be able to explain the complete project.

## Run locally

Extract the full project and open `index.html` in a modern browser. No build or package installation is required. For consistent storage across pages, use VS Code Live Server or any static HTTP server. If Node.js is installed:

```sh
node tools/serve.mjs
```

Open `http://127.0.0.1:4173`. Stop with Ctrl+C. Use localhost or the published HTTPS site to test registration and persistent browser storage. Opening files directly can behave differently between browsers.

## Data and inquiry forms

`js/data.js` contains the products and categories arrays. The cart stores product IDs and quantities; prices always come from the catalog. Store state in `localStorage` includes cart, favorites, theme, delivery selection and an accepted coupon. Invalid saved IDs, quantities and preferences are discarded. If storage is blocked, the current shopping page still works and shows a notice.

## Demo account

Open Log in and use `student@autoparts.demo` / `AutoParts123!`, or create an account with sample details. Registered accounts are local to this browser: name, normalized email, random salt and PBKDF2 password digest are saved in a separate localStorage record. Passwords are not stored as plaintext. A session containing the name/email and expiry lasts in sessionStorage for up to 24 hours or until logout/tab closure. Signing in prefills the cart inquiry; guest inquiries remain available. Cart and favorites are shared by guest and demo accounts in the same browser.

This demonstrates frontend form and state handling. It does not provide server authentication, protected data, cross-device accounts or real account recovery. Use sample credentials. Production authentication needs a backend or identity service.

## Cart estimates

Promo `ENDTERM10` takes 10% off products. Standard delivery is $15, or free when products total at least $300 **after discounts**. Express is $30; pickup is free. Calculations use integer cents. A three-unit air filter plus one rotor is $324; with the coupon it is $291.60 before delivery, $306.60 with Standard or $321.60 with Express. All delivery/discount figures are classroom demo estimates; final prices require store confirmation.

Contact and cart inquiry forms use custom JavaScript validation and prevent default submission. Valid input produces a success message and a downloadable `.txt` inquiry, including discount, delivery and estimated total for the cart. The visitor sends it to the displayed store email. No payment is processed and no message is sent automatically. Contact/inquiry form input is not persisted; demo registration data is stored as described above.

## Test the interactive functions

1. On Home, search `rotor`: Products should show Front Brake Rotor. Search `BRK-204` directly in Products for the same result.
2. Reset filters. Choose Engine Parts and Over $200: the empty state should appear. Reset again: all seven products return.
3. Sort by Price: low to high: the air filter ($45) comes first and the shock absorber ($245) comes last.
4. Favorite a product, enable Favorites, then unfavorite it: the list and count update, with an empty state if necessary.
5. Add an air filter twice and open Cart: product subtotal $90, Standard delivery $15, estimate $105. Use +/− or enter quantity 3: product subtotal $135. Values 0 and 100 are rejected. Add a rotor: products total $324 and Standard delivery is free. Remove a product and Undo; clear the cart and Undo; save a product for later and check Favorites.
6. Add a product, change page and reload: cart badge and cart persist over HTTP. Change the theme and reload.
7. Submit an empty Contact form. Try `not-an-email`, a one-character name, phone `123`, and a message shorter than 20 characters. Correct everything, select a topic and check confirmation: a success message and download link appear. Download and inspect the inquiry.
8. In Cart, try a wrong promo, then ENDTERM10; change Standard/Express/Pickup and check the figures above. Complete the inquiry and inspect the downloaded item lines, discount, delivery and estimated total. An empty cart shows a catalog link and hides the inquiry.
9. Open a FAQ answer; open another and observe the first close. Search `delivery`; search `zzzz` for an empty result. Clear the search. Use Part details on a product card to check the slide effect.
10. Search `brake` on Categories and open Explore category: only brake products appear. Clear the search to restore seven categories.
11. At a narrow viewport, check all seven pages, mobile navigation, keyboard focus and Escape to close the menu. Keep Console open; normal interactions should produce no errors.
12. Open Log in: submit empty fields and an incorrect password. Try the provided demo credentials, refresh, open Cart and check name/email autofill. Log out; create a sample account, check mismatched passwords, then submit matching passwords. Log out and sign back in to the new account. Test Show password and keyboard switching between account tabs.

Core state and calculation tests run without installing dependencies:

```sh
node --test tests/store.test.cjs
```

See [all endterm changes in Russian](docs/ENDTERM_CHANGES_RU.md), [requirement map](docs/REQUIREMENTS.md), [Russian defence guide](docs/DEFENCE_RU.md), [upload instructions](docs/UPLOAD_RU.md) and [verification record](docs/VERIFICATION.md).

## Publish with GitHub Pages

Publication is the final team step. Upload the three parts sequentially to a shared `endterm` branch in the existing repository, then merge it into `main` while preserving the three commits. Follow [the step-by-step upload guide](docs/UPLOAD_RU.md). This package has not changed any GitHub account or repository.

1. Keep all seven HTML files, `css`, `js`, `assets`, `vendor`, `tools`, `tests` and `docs` at the repository root. Keep the original assets and Bootstrap files.
2. Open Settings → Pages. Under Build and deployment, choose Deploy from a branch, select `main` and `/ (root)`, then Save.
3. Wait for the deployment and open the URL shown by GitHub. Verify all seven pages, login and forms there, then submit that working link.
4. The expected project URL is `https://mikosh001.github.io/web-autoparts-online-store/`. This is an expected URL, not a claim that deployment is active. Add the verified address to README after publication.

Official guide: [Publishing from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Libraries and sources

- Existing local Bootstrap CSS from the midterm; its license header is preserved.
- Local [jQuery 3.7.1](https://code.jquery.com/jquery-3.7.1.min.js); MIT license in `vendor/jquery-LICENSE.txt`.
- Geist and Outfit fonts stored locally under `vendor/fonts`; SIL Open Font Licenses included.
- Original assets and responsive CSS retained from [our midterm repository](https://github.com/Mikosh001/web-autoparts-online-store).
- jQuery API: [closest](https://api.jquery.com/closest/), [slideDown](https://api.jquery.com/slideDown/), [fadeOut](https://api.jquery.com/fadeOut/).
- Web Crypto reference: [PBKDF2 derivation](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits).

No third-party CDN is needed to display or use the site after download.

# Final team handoff

Base: `8f1b2f1f6ab8cda4d84d1cece0ac640849cda88b` from `Mikosh001/web-autoparts-online-store` main. Keep that commit/history; these ZIPs are patches to that exact endterm.

## Responsibilities and shared interfaces

- Meirbek Berdibek (@Mikosh001): Product OOP, catalog data/search compatibility, recently viewed, Home/Categories/About and jQuery integration.
- Beimzhan Otegen (@PactusOs): exchange-rate API, complete saved-request CRUD, Products/Cart display and product images.
- Aslan Sabyr (@asikxz008): inquiry wizard/shared validation, Login/Contact compatibility, common styles/navigation integration, docs and release checks.

Product IDs/prices remain stable; AP.getProduct returns Product instances. AP.quote is the single integer-cent totals source. AP.forms supplies validation/download helpers.
Script order: jQuery → product → data → common → storage → auth → cart → page modules → jquery-ui.
store:change updates dependent views; products:render updates price conversions; recent:change refreshes recent views; currency:change refreshes/invalidate inquiry output.
Cart HTML is assigned to Aslan because it contains the wizard; its row/quote JS is assigned to Beimzhan. Shared-file integration is already included, with one owner per final path.

## Apply and review

1. Save a clean clone at the base SHA. If main has advanced, compare/reconcile the changes before applying these patches.
2. Create a shared review branch, for example final-project, from the base. Keep main/Pages unchanged until integration is checked.
3. Beimzhan extracts AutoParts_Final_Beimzhan.zip into the repository root, reviews/tests/explains his files, then commits from his own account.
4. Meirbek updates to that branch, applies AutoParts_Final_Meirbek.zip at the same root, reviews his files, then makes his own commit.
5. Aslan updates to the branch, applies AutoParts_Final_Aslan.zip at the root, and deletes only the four paths in docs/DELETE_ENDTERM_FILES.txt. He reviews the integration and makes his own commit.
6. Run node tools/serve.mjs and the README test command after all three parts are present. Intermediate patches alone are not complete runnable sites. Each participant checks their own functionality and understands the complete application.
7. Compare with AutoParts_Final_FULL.zip; index.html, js/, css/ and assets/ must be at the same root. The three parts contain no wrapping member directory and no overlapping paths.
8. Each commit uses the participant's real author and current date. Do not rewrite existing history or manufacture contributions. The file split is responsibility guidance, not proof of completed authorship.

The full archive is independently runnable after extraction with index.html at its root. The participant archives include only their added/changed files; Aslan also has the deletion instructions.

## Publication after explicit authorization

1. Review the complete branch/PR, then merge using a merge commit to preserve members' commits/authors. Do not squash away their separate contribution history.
2. Push/merge/publish only after the project owner's explicit permission for the corresponding action.
3. GitHub Pages: Deploy from a branch → main → / (root). Wait for the Pages workflow/deployment to succeed.
4. Open https://mikosh001.github.io/web-autoparts-online-store/ and verify all eight pages including requests.html, live currency, recent views, CRUD, login/Contact and the three-step cart download.
5. Verify that live pages contain final code, not an old cached endterm. Only then update README/FINAL_CHECKS with the confirmed final deployment status.
6. LMS: repository https://github.com/Mikosh001/web-autoparts-online-store and the verified working Pages URL above.

Current status: final code/packages verified locally; final deployment is pending. Existing endterm availability alone is insufficient.

## Exact ownership manifest

Every added, modified or deleted path appears once. Unchanged baseline files remain in FULL and need no member patch.

| Action | Repository-relative path | Final owner |
| --- | --- | --- |
| Update | `README.md` | Aslan |
| Update | `about.html` | Meirbek |
| Update | `assets/air-filter.png` | Beimzhan |
| Update | `assets/battery.png` | Beimzhan |
| Update | `assets/body-mirror.png` | Beimzhan |
| Update | `assets/brake-rotor.png` | Beimzhan |
| Update | `assets/exhaust.png` | Beimzhan |
| Update | `assets/hero.png` | Meirbek |
| Update | `assets/shock-absorber.png` | Beimzhan |
| Update | `assets/tire.png` | Beimzhan |
| Update | `assets/warehouse.png` | Meirbek |
| Update | `assets/workshop.png` | Meirbek |
| Update | `cart.html` | Aslan |
| Update | `categories.html` | Meirbek |
| Update | `contact.html` | Aslan |
| Update | `css/about-contact.css` | Aslan |
| Update | `css/account.css` | Aslan |
| Update | `css/base-footer.css` | Aslan |
| Update | `css/cart.css` | Beimzhan |
| Update | `css/categories.css` | Meirbek |
| Update | `css/endterm-catalog.css` | Beimzhan |
| Update | `css/endterm-common.css` | Aslan |
| Update | `css/endterm-home.css` | Meirbek |
| Add | `css/final.css` | Aslan |
| Update | `css/home.css` | Meirbek |
| Delete | `css/selection.css` | Aslan |
| Update | `docs/DEFENCE_RU.md` | Aslan |
| Add | `docs/DELETE_ENDTERM_FILES.txt` | Aslan |
| Delete | `docs/ENDTERM_CHANGES_RU.md` | Aslan |
| Add | `docs/FINAL_CHECKS.md` | Aslan |
| Update | `docs/REQUIREMENTS.md` | Aslan |
| Add | `docs/TEAM_HANDOFF.md` | Aslan |
| Delete | `docs/UPLOAD_RU.md` | Aslan |
| Delete | `docs/VERIFICATION.md` | Aslan |
| Update | `index.html` | Meirbek |
| Update | `js/auth.js` | Aslan |
| Update | `js/cart.js` | Beimzhan |
| Update | `js/catalog.js` | Meirbek |
| Update | `js/categories.js` | Meirbek |
| Update | `js/common.js` | Aslan |
| Update | `js/data.js` | Meirbek |
| Update | `js/forms.js` | Aslan |
| Update | `js/home.js` | Meirbek |
| Add | `js/inquiry.js` | Aslan |
| Update | `js/jquery-ui.js` | Meirbek |
| Add | `js/product.js` | Meirbek |
| Add | `js/rates.js` | Beimzhan |
| Add | `js/recent.js` | Meirbek |
| Add | `js/requests-store.js` | Beimzhan |
| Add | `js/requests.js` | Beimzhan |
| Add | `js/storage.js` | Aslan |
| Update | `login.html` | Aslan |
| Update | `products.html` | Beimzhan |
| Add | `requests.html` | Beimzhan |
| Update | `style.css` | Aslan |
| Add | `tests/browser.cjs` | Aslan |
| Add | `tests/final.test.cjs` | Meirbek |
| Update | `tests/store.test.cjs` | Meirbek |
| Add | `tests/structure.cjs` | Aslan |
| Update | `tools/serve.mjs` | Aslan |

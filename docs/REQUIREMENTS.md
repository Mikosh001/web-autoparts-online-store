# Final requirement map

Specification: final_project_requirements.docx, read in full. Same topic and team as endterm.
Baseline commit: `8f1b2f1f6ab8cda4d84d1cece0ac640849cda88b` (remote main checked before packaging).
Exactly five substantial final additions are counted below, once each.

| Requirement | Endterm state | Final addition | Main files and calls | Verification | Responsible |
| --- | --- | --- | --- | --- | --- |
| F1: mandatory API | No external price conversion | Live USD→KZT/EUR estimates; loading/success/empty/error/retry; validated limited cache; visible attribution | `js/rates.js`: parseRates, load, conversionText; price placeholders in common/catalog/cart; Home/Products/Cart panels | Unit API cases; real browser fetch/CORS; browser failure/retry/cache scenarios | Beimzhan |
| F2: mandatory OOP | Seven plain product records | Seven Product instances; constructor preserves fields; matches drives search; priceInCents drives shared cart quote | `js/product.js`, `js/data.js`; calls in `js/catalog.js` and `js/cart.js` | Product and original catalog/cent-quote tests; browser SKU search and totals | Meirbek |
| F3: mandatory new storage | Cart, favorites, theme and delivery already persisted | Distinct recent-view list; valid unique IDs, latest first, max five; reload and isolated clear | `js/recent.js`, one open branch of `js/jquery-ui.js`; Home/Products lists | Sanitization/blocked-storage tests; browser open/close/reload/clear | Meirbek |
| F4: additional CRUD | Cart/favorites existed; no request records | Local product-linked requests, stable IDs/date, quantity, note, status; create/read/update/delete/cancel | `requests.html`, `js/requests-store.js`, `js/requests.js` | Multiple-record CRUD and corrupt-storage tests; browser validation/cancel/edit/reload/delete and safe text | Beimzhan |
| F5: additional advanced form | Single validated cart form and inquiry download | Three steps, Back/Next, validation/focus/progress; dependent address; synchronized review/download | `cart.html`, `js/inquiry.js`, shared `js/forms.js`; totals from AP.quote | Unit quote/pickup cases; browser transitions, invalidation and actual download comparison | Aslan |
| Preserve endterm (not counted again) | Search/filter/sort, comparison, favorites, cart quantity/undo/save-for-later, ENDTERM10, delivery, accounts, Contact, theme, FAQ/details | Retained with original IDs and storage keys | Existing modules; PBKDF2 format remains compatible | All 12 original tests plus browser regressions | All; file owners in handoff |
| Responsive/interface | Original orange/charcoal Bootstrap/CSS design | Shared controls, eight-page navigation, both themes, smaller original PNGs | `css/final.css`, shared/page CSS and HTML; same asset paths | 360/390/768/1280/1440 CSS-px widths × 8 pages × 2 themes | Aslan coordinates |
| Delivery/docs | Endterm published; verification/upload docs partly stale | Brief README, current check record, exact ownership/patch instructions | README and docs | ZIP reconstruction/byte comparison and extracted reference checks | Aslan |

Original state keys and saved-account format remain unchanged.
New keys: `autoparts-final-recent-v1`, `autoparts-final-requests-v1`, `autoparts-final-rates-v1`, `autoparts-final-currency-v1`.
No API response or personal test account data is bundled. API failure tests use test-only fixtures; normal UI uses the provider.
Final version published and verified: https://mikosh001.github.io/web-autoparts-online-store/. All five additions passed the full live browser suite; see FINAL_CHECKS.md.

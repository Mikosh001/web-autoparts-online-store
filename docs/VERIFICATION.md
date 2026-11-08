# Verification record

Verified locally on 8 November 2026. This record covers the supplied package; GitHub publication and the live URL still require team action after uploading.

Final upload review: the code package is ready to upload. All listed technical requirements were mapped to source code and checked against the Word document. Public deployment and the group defence remain the team's final deliverables.

The final review corrected logout after registration (it now opens and focuses Log in), coupon editing/error consistency during cart recalculation, category-count spacing, and category/footer text contrast.

## Browser verification

All seven pages were opened in a Chromium-based browser over local HTTP. The following interactions were exercised:

- Home quick search `mirror` opened Products with Side Mirror only.
- Category search `brake` returned one category; its link opened `products.html?category=brakes` and displayed Front Brake Rotor only.
- Catalog search `BRK-204` returned one matching product.
- All 32 category/price combinations returned the expected counts. Engine Parts combined with Over $200 produced an empty state; reset restored all seven products.
- Ascending price sort produced 45, 89, 165, 189, 199, 229, 245.
- Favorites filtering, removing the last favorite and the favorites empty state worked.
- The cart is now on cart.html. +/− controls and manual quantity input update subtotals; values outside 1–99 are rejected. Three filters plus one rotor produced $324 before discounts.
- Invalid promo codes showed a field error; ENDTERM10 produced a $32.40 discount. Standard delivery then produced $306.60, Pickup $291.60 and Express $321.60. Delivery/coupon persisted after reload.
- Save for later moved a product to Favorites. Undo restored removal. Clear cart showed the empty state and Undo restored the full cart.
- Cart and theme persisted across page navigation and reload over HTTP.
- Empty and invalid Contact form submissions showed specific field messages. Valid data produced the success state and a downloadable text file. Optional phone was checked both empty and populated.
- Empty Cart hides the inquiry and links back to the catalog. A valid cart inquiry downloaded product SKUs, quantities, discount, delivery and the $321.60 estimated total. Downloaded contact/order files were opened and inspected.
- Empty login and incorrect credentials showed errors. Public demo credentials signed in, and logout returned to the form. Registration rejected mismatched passwords, accepted matching values, created a profile, and supported logout followed by another login. Account name/email prefilled the cart inquiry and persisted across navigation/reload in the tab.
- Product details opened with the jQuery slide effect. FAQ answers opened and closed neighboring answers. FAQ search supported matching and empty states.
- Mobile menu opened and closed with Escape.
- Final responsive pass: all seven pages at 320, 375, 768, 1024 and 1440 pixels, in light and dark themes: 70 page/size/theme cases, with no horizontal overflow. Header controls also had no overlapping rectangles in the light-theme pass. Full-page screenshots were visually reviewed; shared fonts, surfaces, orange accents and spacing remain consistent.
- No browser console errors were reported during the tested normal-use interactions.

## Code and package checks

- All nine application JavaScript files passed `node --check`.
- Twelve Node tests passed: catalog integrity; storage recovery; sanitation; cart merge/removal; quantity limits; favorites; formatting/escaping; quantity changes; discount/delivery rounding and thresholds; demo login/logout; registration with different salts and later login; expired sessions/invalid saved accounts.
- Local HTML/CSS references, required error containers, duplicate IDs and script order were checked during packaging.
- All 77 project files returned HTTP 200 with exact matching bytes from a local /web-autoparts-online-store/ mount, simulating the GitHub Pages project path. Reference spelling/case is checked so Windows does not hide a casing error before deployment.
- Each changed/new file belongs to exactly one member's archive. Applying all three archives to the original midterm reproduces the complete project byte for byte.
- Bootstrap, jQuery, images and fonts are local. Font and jQuery licenses are included.

## Final team checks after upload

Enable GitHub Pages, wait for a successful deployment, verify the actual public URL, repeat README tests on all seven pages, and add the confirmed URL to README. Use localhost/HTTPS for registration. Test the defence device/browser. Safari, Firefox and a real mobile device were not independently tested in this session. Demo accounts do not provide production server authentication.

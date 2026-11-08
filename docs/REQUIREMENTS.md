# Endterm requirement map

This map relates the supplied Endterm Project Requirements document to implemented features. Deployment must be completed by the team after uploading the three parts.

| Requirement | Implementation | Demonstration |
| --- | --- | --- |
| Continue the same topic, group and at least five connected pages | Original five pages retained; cart.html and login.html added; same team, header/footer, Bootstrap, images and responsive CSS | Navigate all seven pages |
| Two arrays | `products`, `categories` in `js/data.js`; cart/favorites in `common.js` | Explain an object with id, SKU, category, price and image |
| Two loops | `for...of` in state sanitation and inquiry export; `forEach` in cart and validation; `for...of` in categories | Locate loops in common.js, cart.js, forms.js, categories.js |
| Four reusable functions with parameters and return | `money(value)`, `getProduct(id)`, `categoryName(id)`, `productCard(product, heading)`, `filterProducts(...)`, `getCartQuote(cart, delivery, coupon)`, `validateField(field)` | Explain returned values and calling code |
| Dynamic content from arrays | Product/featured cards, categories, cart rows, comparison table | Change filters and explain DOM rebuilding |
| DOM selection and updates | getElementById, querySelectorAll, textContent, classList, setAttribute, hidden | Favorite a product; trigger an error |
| Add/remove DOM elements | createElement, append, replaceChildren in cart, categories and form results | Add/remove a cart item |
| At least five useful features | Search, filters, sorting, favorites, separate cart, quantities, undo, save for later, delivery, promo code, demo account, theme, FAQ and details | Follow README tests |
| addEventListener and four meaningful interactions | Search, filters, sort, favorites, cart, forms, theme, menu | Inspect handlers |
| Three event types, event object, preventDefault | DOMContentLoaded, click, input, change, submit, blur, keydown; store:change | Explain event.target, event.key and submit prevention |
| Substantial custom form validation | Contact rules retained; login/registration also check required data, email, password length and matching confirmation | Submit empty, invalid and valid examples |
| Field messages and success | forms.js prevents submission, shows specific field errors, focuses first error and prepares download | Inspect field-error, form-summary and form-result |
| jQuery loaded correctly | Local full build with defer before jquery-ui.js | Check HTML script order |
| Two selector types | IDs #faq/#faq-search; classes .faq-question/.faq-item; attribute [data-details]; descendant #faq .faq-item | Open jquery-ui.js |
| Two traversal methods | closest, find, children, siblings | Explain answer and sibling selection |
| Two jQuery events | click for FAQ/details; input for FAQ search | Click and search |
| Two useful effects | slideDown/slideUp for answers/details; fadeIn/fadeOut for matching questions | Demonstrate both; reduced-motion supported |
| External organized JS | Nine purpose-specific JS files including auth.js | Explain shared AutoParts object and defer order |
| UX and accessibility | Bootstrap grid, responsive CSS, labels, aria-describedby, aria-expanded, focus, status messages | Resize and use keyboard |
| README, team and testing | Root README and docs | Open README |
| Working published link | Ready for GitHub Pages; upload and publication still required | Follow UPLOAD_RU.md and verify deployment |
| Defence by all members | DEFENCE_RU.md | Rehearse whole project |


# Подготовка к индивидуальной защите final

AutoParts продолжает endterm: восемь страниц и пять дополнений. Каждый должен понимать весь сайт; защита включает минимум четыре вопроса и чтение/изменение/отладку кода. Оценка заранее не гарантируется.

## Показ проекта

1. Home → поиск; Categories → фильтр; Products → сортировка, Favorites и comparison.
2. KZT/EUR: приблизительная цена, время обновления и провайдер. Без сети USD остаётся доступен, есть Retry.
3. Part details → Recently viewed → reload и Clear.
4. Requests: создать два запроса, изменить один, отменить редактирование, удалить; reload сохраняет данные.
5. Cart: три air filter и один rotor; ENDTERM10 + Standard = $306.60. Пройти три шага и скачать inquiry.
6. Pickup исключает адрес. Изменение количества/доставки отменяет старую ссылку скачивания.
7. Показать Contact, demo login, FAQ, мобильное меню и обе темы.

## Meirbek: свой код и четыре вопроса

`js/product.js`: constructor присваивает свойства. `new Product(data)` создаёт экземпляр; `this` указывает на него. `matches` вызывается поиском, `priceInCents` — общей quote-функцией.
`js/recent.js`: отдельный ключ, JSON.parse/stringify, проверка ID, Set для повторов и slice(0, 5). Список меняется из одного delegated jQuery handler только при открытии details.

1. Чем HTML-семантика отличается от div/span? Объяснить header/nav/main/section/article/footer, label/id и alt.
2. Как Bootstrap row/col отличаются от CSS Grid? Показать обе сетки и media query.
3. Что произойдёт с API при HTTP 503 и зачем try/catch?
4. Как изменить максимум recent views с пяти на три и где поправить интерфейс/тест?

## Beimzhan: свой код и четыре вопроса

`js/rates.js`: async/await ждёт fetch и response.json; response.ok проверяет HTTP. Проверяются result/base_code, KZT/EUR и даты. Ошибка сохраняет USD и показывает Retry.
Кеш содержит нужные курсы и metadata; expires ограничен следующим обновлением/24 часами. Параллельные вызовы используют pending.
`js/requests-store.js`: CRUD сохраняет ID/createdAt при обновлении; товар берётся по productId из каталога.

1. Чем API отличается от localStorage? Что будет без сети или при запрещённом хранилище?
2. Зачем note выводится через textContent, а не innerHTML?
3. Почему USD считают в целых центах и где общая функция скидки/доставки?
4. Как найти и исправить quantity 100 или неизвестный productId?

## Aslan: свой код и четыре вопроса

`js/inquiry.js`: step выбирает раздел; Next проверяет текущий шаг, Back сохраняет ввод; ошибка получает фокус. aria-current и progress показывают шаг.
Standard/Express требуют адрес; Pickup отключает поле и исключает его значение из результата. Все суммы берутся из AP.quote.
Один текст используется для review и Blob-download. Изменения формы/корзины/валюты отзывают прежний object URL.
`js/forms.js` сохраняет Contact validation/download; Auth заполняет пустые name/email, гостевой сценарий работает.

1. Что делают preventDefault, addEventListener, DOMContentLoaded и defer?
2. Почему данные корзины, аккаунтов и recent views хранятся раздельно?
3. Чем justify-content отличается от align-items при row и column?
4. Как изменить цену/количество и проверить обновление review и файла?

## Прежний helper паролей

`derivePassword` в `js/auth.js`: Web Crypto PBKDF2, SHA-256, 100000 итераций и случайная соль на аккаунт. Сохраняется digest. Параметры и формат сохранены ради уже созданных демоаккаунтов. Серверной авторизации сайт не предоставляет.

## Теория всего курса

Объяснять const/let, условия, циклы, filter/map/find/sort/reduce, функции и return; DOM, события/delegation; jQuery closest/slideUp/slideDown/fadeIn/fadeOut; Promise, async/await, fetch, JSON, try/catch; class/constructor/this/new; localStorage/sessionStorage.
По HTML/CSS: семантика, формы, селекторы, каскад, box model, Flexbox/Grid, Bootstrap, media queries и доступность.

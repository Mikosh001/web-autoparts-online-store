# Как загрузить три части в один репозиторий

Используйте существующий Mikosh001/web-autoparts-online-store, тот же проект и ту же команду. Каждый архив содержит только новые или изменённые файлы участника с путями от корня. Изображения, Bootstrap и остальные CSS остаются из мидтерма.

## Meirbek Berdibek — 01-Meirbek.zip — 15 файлов

Главная, категории, About и jQuery FAQ.

```text
index.html
categories.html
about.html
js/data.js
js/home.js
js/categories.js
js/jquery-ui.js
css/endterm-home.css
docs/REQUIREMENTS.md
vendor/jquery-3.7.1.min.js
vendor/jquery-LICENSE.txt
vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf
vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4ZmyC4E.ttf
vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf
vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf
```

## Beimzhan Otegen — 02-Beimzhan.zip — 15 файлов

Каталог, корзина, общее состояние и тема.

```text
products.html
cart.html
js/catalog.js
js/cart.js
js/common.js
css/endterm-catalog.css
css/endterm-common.css
tests/store.test.cjs
docs/VERIFICATION.md
tools/serve.mjs
vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RHOQ4nQ.ttf
vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RQuQ4nQ.ttf
vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_Re-Q4nQ.ttf
vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf
vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RruM4nQ.ttf
```

## Aslan Sabyr — 03-Aslan.zip — 15 файлов

Вход, регистрация, Contact и проверка форм.

```text
login.html
contact.html
js/auth.js
js/forms.js
css/account.css
css/base-footer.css
style.css
README.md
docs/DEFENCE_RU.md
docs/ENDTERM_CHANGES_RU.md
docs/UPLOAD_RU.md
.nojekyll
vendor/fonts.css
vendor/fonts/Geist-OFL.txt
vendor/fonts/Outfit-OFL.txt
```

Все 45 новых или изменённых файлов разделены строго поровну: 15 + 15 + 15. Стили, библиотеки, шрифты и документация также распределены. Каждый файл находится только в одном архиве. Точные SHA-256 приведены в TEAM-MANIFEST.json рядом с архивами.

## Через браузер GitHub

1. Скачайте последние архивы из чата и распакуйте каждый через «Извлечь всё». Meirbek использует 01-Meirbek.zip, Beimzhan — 02-Beimzhan.zip, Aslan — 03-Aslan.zip. В каждой папке находятся файлы и подпапки, которые нужно загрузить, а не целый самостоятельный сайт.
2. Владелец открывает существующий репозиторий, затем Settings → Collaborators → Add people. Добавляет остальных по их GitHub-логинам, если доступа ещё нет. Оба принимают приглашение. Каждый входит в собственный аккаунт.
3. Владелец открывает вкладку Code, выбирает ветку main над списком файлов и создаёт от неё ветку `endterm`. Если она уже создана для этой работы, продолжайте в ней. Все трое дальше выбирают именно `endterm`.
4. Meirbek в корне ветки endterm выбирает Add file → Upload files и перетаскивает всё содержимое своего архива, включая вложенные папки. Проверяет 15 путей по своему списку выше. Загружается содержимое, а не сам ZIP и не внешняя папка с именем участника.
5. Meirbek указывает сообщение `Add home, categories, About and jQuery interactions`, выбирает коммит в текущую ветку endterm и подтверждает Commit changes. GitHub может показывать Propose changes при создании новой ветки; для данного сценария общая endterm уже создана владельцем.
6. Beimzhan обновляет страницу, проверяет ветку endterm и таким же способом загружает 15 файлов своей части. Сообщение: `Add catalog, cart, shared UI and checks`.
7. Aslan обновляет страницу, проверяет ветку endterm и загружает 15 файлов своей части вместе с вложенными папками и .nojekyll. Сообщение: `Add login, Contact, validation and documentation`.
8. Каждый проверяет, что пути выглядят как `js/cart.js`, `css/account.css`, `vendor/fonts/...`, а не `02-Beimzhan/js/cart.js`. Новые файлы добавляются, существующие по тем же путям обновляются; остальные файлы мидтерма остаются. Если перетаскивание папок не сохраняет пути, используйте Git ниже.
9. После всех трёх загрузок в корне endterm должны быть семь HTML-страниц, style.css, README.md, .nojekyll и папки assets, css, js, vendor, docs, tools, tests. В Commits проверьте три коммита от трёх участников. Промежуточная версия между загрузками может ссылаться на ещё не добавленные файлы.
10. Владелец открывает Pull requests → New pull request, выбирает base: main и compare: endterm. Проверяет Files changed и создаёт PR, например `Complete AutoParts endterm project`.
11. После проверки владелец нажимает Merge pull request и выбирает **Create a merge commit**: так все три отдельных коммита сохранятся в истории main. Затем подтверждает слияние. Если репозиторий требует дополнительные проверки, сначала выполните указанные им условия.
12. Опубликуйте main через GitHub Pages по разделу ниже. Отдельную ветку endterm не выбирайте источником финального сайта.

Часть участника не запускается отдельно: её накладывают на мидтерм. Для просмотра целого проекта используйте autoparts-endterm-full.zip. Полный архив служит для локальной проверки и резервной копии. Каждый загружает свою часть после разбора кода; на защите все отвечают по всему проекту.

## Через Git

Каждый использует свою локальную копию и собственный вход GitHub. Сначала:

```sh
git clone https://github.com/Mikosh001/web-autoparts-online-store.git
cd web-autoparts-online-store
git fetch origin
git switch endterm
git pull --ff-only
```

Если копия уже есть, clone не повторяйте. Проверьте git status и обновитесь до копирования своей части. Скопируйте содержимое своего архива в корень с заменой одноимённых файлов. Проверьте `git config user.name` и `git config user.email`: автор коммита должен соответствовать вашим реальным данным. GitHub-вход и данные автора коммита — отдельные настройки.

Meirbek:

```sh
git add index.html categories.html about.html js/data.js js/home.js js/categories.js js/jquery-ui.js css/endterm-home.css docs/REQUIREMENTS.md vendor/jquery-3.7.1.min.js vendor/jquery-LICENSE.txt vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4ZmyC4E.ttf vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4bCyC4E.ttf vendor/fonts/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4E.ttf
git commit -m "Add home, categories, About and jQuery interactions"
git push origin endterm
```

Beimzhan:

```sh
git add products.html cart.html js/catalog.js js/cart.js js/common.js css/endterm-catalog.css css/endterm-common.css tests/store.test.cjs docs/VERIFICATION.md tools/serve.mjs vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RHOQ4nQ.ttf vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RQuQ4nQ.ttf vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_Re-Q4nQ.ttf vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf vendor/fonts/gyBhhwUxId8gMGYQMKR3pzfaWI_RruM4nQ.ttf
git commit -m "Add catalog, cart, shared UI and checks"
git push origin endterm
```

Aslan:

```sh
git add login.html contact.html js/auth.js js/forms.js css/account.css css/base-footer.css style.css README.md docs/DEFENCE_RU.md docs/ENDTERM_CHANGES_RU.md docs/UPLOAD_RU.md .nojekyll vendor/fonts.css vendor/fonts/Geist-OFL.txt vendor/fonts/Outfit-OFL.txt
git commit -m "Add login, Contact, validation and documentation"
git push origin endterm
```

Ветку endterm сначала создаёт владелец от main. Следующий участник перед копированием своей части обновляет endterm через git pull --ff-only. Не используйте force push и не переписывайте старые коммиты. После всех трёх частей владелец создаёт один Pull Request endterm → main и сохраняет отдельные коммиты способом Create a merge commit.

## Публикация и сдача

После слияния endterm → main владелец открывает Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → / (root) → Save. Папку docs источником публикации не выбирайте: index.html находится в корне.

Дождитесь успешного Pages deployment в Actions или Settings → Pages. Откройте адрес, который покажет GitHub, и пройдите проверки README. Ожидается `https://mikosh001.github.io/web-autoparts-online-store/`, но ссылка готова только после успешного деплоя и проверки. Добавьте подтверждённый URL в README и отправьте преподавателю.

После публикации каждый открывает сайт и проверяет: все семь страниц; поиск BRK-204; категорию и цену; избранное; корзину, +/− и Undo; ENDTERM10 и доставку; вход и выход; ошибочную/корректную контактную форму; скачивание заявки; FAQ; тему; мобильное меню. Обновите страницу с Ctrl+F5, если браузер показывает старые стили. Aslan добавляет проверенную рабочую ссылку в README отдельным коммитом. Отправьте преподавателю ссылку на сайт и репозиторий согласно формату сдачи.

Для тестового входа: student@autoparts.demo / AutoParts123!. Вход локальный учебный, форма готовит скачиваемый файл; серверная отправка и платежи не подключены. Это соответствует статическому формату проекта, который разрешён в задании.

Официальные инструкции:
- Загрузка файлов: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Ни один файл этого пакета ещё не отправлен в GitHub. Коммитьте свою часть после личного разбора и тестирования; для защиты каждый готовится по всему проекту.

[![CI](https://github.com/DjonniStorm/online-resume/actions/workflows/ci.yml/badge.svg)](https://github.com/DjonniStorm/online-resume/actions/workflows/ci.yml)

### Разработка web-приложения для онлайн-создания, редактирования и оформления резюме

### Браузерные тесты приложения

Из корня репозитория запустите `pnpm test:browser` для прогона в Chromium
или `pnpm test:browser:ui`, чтобы открыть интерактивный режим Playwright.
В UI можно запустить отдельный сценарий и посмотреть шаги и снимки DOM.
Чтобы открыть UI во вкладке браузера, запустите
`pnpm test:browser:ui --ui-host 127.0.0.1 --ui-port 9324`
и откройте [локальную страницу Playwright](http://127.0.0.1:9324).
Playwright запускает веб-приложение; ответы API в браузерных тестах подменяются, поэтому PostgreSQL для них не нужен.
Пример в `apps/web/test/browser/templates.spec.ts` открывает настоящую страницу `/templates`:
проверяет две карточки, вводит запрос, проверяет фильтрацию и открывает предпросмотр.
Подменяются только ответы сервера. Тест не проверяет базу данных и не заменяет API-тесты.
В UI режиме можно открыть этот сценарий, запустить его и посмотреть действия в браузере.

Если Chromium для Playwright ещё не установлен, выполните
`pnpm --filter @online-resume/web exec playwright install chromium`.
В GitHub Actions отчёт Playwright и трейсы упавших тестов доступны в артефакте `metrics`.


[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=300&color=DDBFF7&background=FFEDE738&center=true&vCenter=true&multiline=true&width=500&height=100&lines=%D0%A0%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0+web-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F;%D0%B4%D0%BB%D1%8F+%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD-%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F%2C;%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F+%D0%B8+%D0%BE%D1%84%D0%BE%D1%80%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F+%D1%80%D0%B5%D0%B7%D1%8E%D0%BC%D0%B5)](https://git.io/typing-svg)

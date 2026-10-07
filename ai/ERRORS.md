# Errors

## Одинаковый экспертный блок во всех статьях (2026-07-12)

**Симптом:** на страницах статей выводился одинаковый блок `О чём этот разбор` с универсальным текстом, из-за чего материалы выглядели шаблонно.

**Причина:** блок был захардкожен в шаблоне страницы статьи и не зависел от конкретного материала.

**Решение:** блок удалён из шаблона статьи; индивидуальный смысл материала остаётся в `excerpt`, тегах и основном контенте.

**Файл:** `packages/web/src/app/articles/[slug]/page.tsx`

## Сайт и CMS не поднялись после перезагрузки сервера (2026-08-19)

**Симптом:** `paulislava.space` и `cms.paulislava.space` отдавали 502. Контейнеров `paulislava_web` и `paulislava_cms` не было в `docker ps -a` вообще — не остановлены, а отсутствовали.

**Причина:** двойная. Во-первых, в `ci.yml` оба контейнера запускались через `docker run` без `--restart`, поэтому после перезагрузки сервера 18 августа в 12:22 UTC остались в состоянии Exited. Во-вторых, job `clean` (и такой же шаг в CI соседнего проекта beznomera на том же сервере) выполнял `docker container prune -f`, который сносит любые остановленные контейнеры: `paulislava_cms` был уничтожен в 12:35 UTC, через 13 минут после ребута, деплоем чужого проекта.

**Дополнительно:** ручной перезапуск деплоя тоже упал — job `build-web` собирается раньше, чем `deploy-cms` поднимает CMS, а prerender страницы `/articles` ходит в `https://cms.paulislava.space/graphql`. При холодном старте GraphQL отвечал 502 и Next.js падал с `Error occurred prerendering page "/articles"`.

**Решение:** контейнеры подняты перезапуском пайплайна `CI/CD` (env для web и cms генерируются в CI из `vars.WEB_ENV` / `vars.CMS_ENV` и удаляются с диска, поэтому вручную их корректно не запустить). В `ci.yml`: добавлен `--restart unless-stopped` обоим контейнерам, `build-web` получил `needs: deploy-cms` с `if: always() && (success || skipped)` ради сборки на PR, из job `clean` убран `docker container prune -f`.

**Файл:** `.github/workflows/ci.yml`

## Content Manager зависал при успешных API-запросах (2026-10-02)

**Симптом:** Content Manager бесконечно загружался, хотя init/settings отвечали 200.

**Причина:** `@strapi/plugin-graphql` с диапазоном `^5.49.0` при Docker-сборке подтянул 5.53.0 и второй `@strapi/admin`, тогда как core оставался 5.49.0. Две версии admin создали несовместимые экземпляры RTK adminApi.

**Решение:** GraphQL закреплён на 5.49.0; `scripts/check-strapi-versions.cjs` проверяет единый набор версий при Docker-сборке. После деплоя Content Manager и создание баннеров открываются. Проверка на старом контейнере выявила смешанные версии; на новом — единые 5.49.0.

**Файлы:** `packages/cms/package.json`, `package-lock.json`, `packages/cms/Dockerfile`, `packages/cms/scripts/check-strapi-versions.cjs`.

## Публичная конфигурация баннера возвращала 503 (2026-10-06)

Причина: STRAPI_URL=http://host.docker.internal:1337 в web bridge-контейнере недоступен, CMS работает в host network. Публичный HTTPS CMS из контейнера отвечает 200. Исправлено STRAPI_URL=https://cms.paulislava.space в текущем web-контейнере и GitHub WEB_ENV. Предыдущий контейнер сохранён остановленным для rollback. Проверены конфигурация и автоматический GIF по опубликованной записи. Изменения исходного кода не требуются.

## Страница «Водомер» падала при открытии MDX-поля (2026-10-08)

**Симптом:** Content Manager показывал `Unrecognized extension value in extension set` на странице `vodomer-page`.

**Причина:** в production-контейнере у CMS был `@codemirror/state` 6.7.6, а `@strapi/design-system` загружал собственный экземпляр 6.7.1. Расширения MDX-редактора не проходили проверку `instanceof` между экземплярами CodeMirror.

**Решение:** в Vite-конфигурации админки включён `resolve.dedupe` для `@codemirror/state` и `@codemirror/view` с сохранением стандартного списка Strapi. Сборка CMS прошла, после деплоя документ «Водомер» и раскрытое MDX-поле открылись без ошибки. Локальная CMS запущена на `http://localhost:1337` с отдельной PostgreSQL-базой на `127.0.0.1:5444`, заполненной снимком production; вход требует учётных данных администратора CMS.

**Файл:** `packages/cms/src/admin/vite.config.ts`.

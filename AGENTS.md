# Инструкции проекта paulislava.space

## Скиллы проекта

На запрос «баннер для сайта <домен>» прочитай и выполни [.agents/skills/site-banner/SKILL.md](.agents/skills/site-banner/SKILL.md): исследование палитры сайта, публикация настроек в Strapi и выдача готового HTML.

Документация баннеров: [ai/features/partner-footer-banners.md](ai/features/partner-footer-banners.md).

## Микроразметка

Генераторы JSON-LD находятся в `packages/web/src/lib/seo.ts`. Для вывода всегда используй `components/seo/JsonLd.tsx`, который экранирует `<`; прямой `JSON.stringify` внутри HTML-script не используй. Сущности связывай стабильными `@id`, данные разметки согласовывай с отображаемым контентом и текущими фильтрами. Не добавляй вымышленные цены, отзывы, рейтинги или общие изображения-заглушки.

Проверка: `npm run test:seo --workspace=packages/web` (Node.js 22.6+), TypeScript, ESLint изменённых файлов и production-сборка. Для Google-поддерживаемых типов используй Rich Results Test, для остальных — Schema Markup Validator. Подробнее: [ai/features/structured-data.md](ai/features/structured-data.md).


## CMS в РЕЗЕРВЕ (2026-11-17)

`cms.paulislava.space` работает на Windows-ПК `DESKTOP-NGNE28E`. Корень — `E:\Services\PaulislavaCMS`; отдельный WSL2 `PaulislavaCMS` принадлежит LocalService, его VHDX и Docker data-root находятся на E. Docker Desktop для CMS не используется. Windows SCM/NSSM службы `PaulislavaCMS` и `PaulislavaCMSFRP` запускаются автоматически без входа пользователя. Linux Docker/containerd units оставлять disabled; runtime запускает Windows-служба.

База `paulislava_cms` находится в основном Windows PostgreSQL 18 (`postgresql-x64-18`, порт 5432, данные `E:\Projects\vpn\.runtime\postgres-data`), отдельный PostgreSQL-контейнер не создавать. Роль CMS имеет доступ только к своей базе; WSL использует текущий Windows gateway.

Нативный frpc на ПК подключается к `13.143.194.252:7000` с отдельной identity и разрешением только TCP/24005. Nginx на VPN-сервере завершает TLS для CMS и направляет запросы через loopback `127.0.0.1:24005`. Сохранять существующие SNI-маршруты VPN и остальных сервисов.

Исходный резерв `E:\backup` не изменять. Рабочие дампы и результаты проверки — `E:\Services\PaulislavaCMS\backup`; перед обновлением делать новый проверенный pg_dump. Секреты остаются вне Git. Скрипты: `scripts/cms-reserve/`; проверки и восстановление: [ai/features/cms-windows-reserve.md](ai/features/cms-windows-reserve.md).

Старый deploy-cms в GitHub Actions допускается только при явном `CMS_DEPLOY_TARGET=legacy`; не включать его для текущего размещения. Старый workflow больше не устанавливает nginx CMS на прежний VPS. Автоматический деплой новых образов на ПК отдельно не настроен.

# Инструкции проекта paulislava.space

## Скиллы проекта

На запрос «баннер для сайта <домен>» прочитай и выполни [.agents/skills/site-banner/SKILL.md](.agents/skills/site-banner/SKILL.md): исследование палитры сайта, публикация настроек в Strapi и выдача готового HTML.

Документация баннеров: [ai/features/partner-footer-banners.md](ai/features/partner-footer-banners.md).

## Микроразметка

Генераторы JSON-LD находятся в `packages/web/src/lib/seo.ts`. Для вывода всегда используй `components/seo/JsonLd.tsx`, который экранирует `<`; прямой `JSON.stringify` внутри HTML-script не используй. Сущности связывай стабильными `@id`, данные разметки согласовывай с отображаемым контентом и текущими фильтрами. Не добавляй вымышленные цены, отзывы, рейтинги или общие изображения-заглушки.

Проверка: `npm run test:seo --workspace=packages/web` (Node.js 22.6+), TypeScript, ESLint изменённых файлов и production-сборка. Для Google-поддерживаемых типов используй Rich Results Test, для остальных — Schema Markup Validator. Подробнее: [ai/features/structured-data.md](ai/features/structured-data.md).

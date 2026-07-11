# Split кейса GigaChat / developers.sber.ru

## Что реализовано

Смешанный кейс `gigachat-dev-portal` разделён на два независимых проекта:

- `giga-chat` — публичный сайт нейросети GigaChat;
- `developers-sber-ru` — портал для разработчиков Сбера.

Это убирает смешение двух разных продуктовых поверхностей в одном кейсе и делает структуру портфолио понятнее для пользователя, поисковиков и AI-краулеров.

## Ключевые решения

- Источник правды для split — Strapi: старый проект удалён, вместо него созданы две новые записи.
- Старый маршрут `/projects/gigachat-dev-portal` не сохраняется как отдельная project page и уводится постоянным redirect на `/projects`.
- В seed-данных один объект заменён на два отдельных проекта, чтобы повторное наполнение CMS не возвращало старую смешанную запись.
- Из project pages убран placeholder-блок `Связанные статьи`, чтобы кейсы не выглядели недописанными.

## Внешние действия

- В Strapi создан проект `giga.chat`.
- В Strapi создан проект `developers.sber.ru`.
- В Strapi удалён проект `gigachat-dev-portal`.

## Файлы

- `packages/web/src/app/projects/[slug]/page.tsx`
- `packages/web/src/components/projects/ProjectCaseStudy.tsx`
- `scripts/seed-projects.ts`

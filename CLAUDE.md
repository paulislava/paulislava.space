# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Личный сайт-портфолио paulislava.space: Next.js фронтенд + Strapi CMS, монорепо на npm workspaces (`packages/cms`, `packages/web`).

## Commands

Всё выполняется из корня репозитория (npm workspaces), если не указано иное.

```bash
# Локальный запуск Strapi (нужен PostgreSQL — только через docker-compose)
docker-compose up -d database cms

# Web dev-сервер (после того как cms поднят)
npm run dev:web

# CMS dev-сервер standalone (обычно не нужен — используй docker-compose)
npm run dev:cms

# Продакшн-сборка обоих пакетов
npm run build

# Lint web
cd packages/web && npm run lint

# Перегенерировать GraphQL-типы (packages/web/src/gql/graphql.ts) после изменений схемы CMS
cd packages/web && npm run generate
```

Тестов в проекте нет.

## Architecture

**Монорепо, две независимые части:**
- `packages/cms` — Strapi 5, content-types (`article`, `article-series`, `news`, `project`, `tag`, `technology`, `work-experience`) в `packages/cms/src/api/*`. Хранилище: PostgreSQL (docker-compose) для дева, S3 (Beget) для медиа. GraphQL включён через `@strapi/plugin-graphql`.
- `packages/web` — Next.js 16 (App Router), React 19. Весь контент тянется из Strapi по GraphQL, статически типизированного через `graphql-codegen`.

**Поток данных web → CMS:**
1. `.graphql`-запросы лежат в `packages/web/src/graphql/*.graphql`.
2. `npm run generate` (в `packages/web`) гоняет `graphql-codegen` против `${STRAPI_URL}/graphql` и генерирует `src/gql/graphql.ts` (аннотирован `// @ts-nocheck`, руками не редактировать — перезатрётся).
3. `packages/web/src/lib/apollo.ts` — серверный Apollo Client (`ssrMode`, кастомный `fetch` прокидывающий Next.js `{ tags, revalidate }` в `next` fetch options).
4. `packages/web/src/lib/strapi.ts` — единственная точка доступа к данным (`getFeaturedProjects`, `getArticleBySlug`, `getAllArticleSeries` и т.д.), каждая функция задаёт свои cache tags и `revalidate` (ISR-подобное кеширование на уровне fetch).
5. `packages/web/src/lib/strapi-types.ts` — доменные типы (`Project`, `Article`, `NewsItem`, ...), отдельные от автогенерированных GraphQL-типов.

**SEO / AI-видимость** (`packages/web/src/lib/seo.ts`, `llms.ts`):
- Стратегия сайта — "case-study first": на главной и в структуре контента кейсы (`projects`) — основной слой доверия, статьи (`articles`) — экспертная поддержка вокруг них.
- `llms.txt` / `llms-full.txt` (`src/app/llms.txt`, `src/app/llms-full.txt`) генерируются динамически из текущих Strapi-данных (`getLlmsSnapshot` в `lib/llms.ts`), не статические файлы.
- JSON-LD (Person, WebSite) централизован в `lib/seo.ts`.
- RSS: три фида (`/rss.xml`, `/rss/articles.xml`, `/rss/news.xml`) через Route Handlers, хелпер `lib/rss.ts`.

**Деплой** (`.github/workflows/ci.yml`): push в `main` собирает Docker-образы cms и web (GHCR), деплоит по SSH на `beznomera.net` через `docker run --network host` (cms, порт 1337) и `-p 4200:3000` (web), с health-check по HTTP перед завершением. Nginx (`nginx/paulislava.conf`, `nginx/cms.conf`) раздаёт статику из `public_html` с проксированием остального на web-контейнер (`0.0.0.0:4200`).

**`scripts/`** — standalone TS-скрипты (`seed.ts`, `seed-projects.ts`) для наполнения Strapi через `npx tsx`, отдельный `package.json`, не часть npm workspaces.

## Working rules

- Strapi всегда поднимать через `docker-compose up -d database cms` — прямой `npx strapi start` не работает без БД из compose.
- После любых изменений схемы CMS — перегенерировать `gql/graphql.ts` через `npm run generate` (Strapi должен быть поднят и доступен по `STRAPI_URL=http://localhost:1337`).
- `packages/web` использует Next.js 16 — до написания кода сверяйся с `packages/web/node_modules/next/dist/docs/` (см. `packages/web/AGENTS.md`), API и конвенции могут отличаться от привычного Next.js.
- Документация фич — `ai/FEATURES.md` (+ `ai/features/*.md` для крупных фич), ошибок — `ai/ERRORS.md`.

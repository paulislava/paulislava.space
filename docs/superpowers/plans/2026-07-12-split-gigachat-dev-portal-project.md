# Split `gigachat-dev-portal` Into `giga.chat` and `developers.sber.ru` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Разделить смешанный кейс `gigachat-dev-portal` на два независимых проекта в CMS и на сайте, чтобы `giga.chat` и `developers.sber.ru` жили как отдельные страницы кейсов.

**Architecture:** Источник правды для данных остаётся в Strapi: старый проект читается как донор, из него создаются две новые записи `project` с раздельными slug, URL и текстами. На фронтенде добавляется redirect со старого slug и обновляется сид, чтобы смешанный кейс больше не появлялся при повторном наполнении.

**Tech Stack:** Strapi MCP, Next.js App Router, TypeScript, route redirects, локальные seed-скрипты

## Global Constraints

- Отвечать и писать пользовательский copy только на русском языке.
- Не терять текущие технологии, featured-флаг и полезный narrative старого кейса при split.
- Старый slug `/projects/gigachat-dev-portal` не должен оставаться живой отдельной страницей-кейсом.
- Изменения в контенте делать через Strapi MCP, а не через прямые SQL/ручные JSON-правки.

---

### Task 1: Подготовить и выполнить split в Strapi

**Files:**
- Modify: `docs/superpowers/plans/2026-07-12-split-gigachat-dev-portal-project.md`
- External: Strapi `api::project.project` entry `gigachat-dev-portal`

**Interfaces:**
- Consumes: существующий проект `gigachat-dev-portal` из Strapi (`documentId`, `technologies`, `featured`, `description`)
- Produces: два новых проекта со slug `giga-chat` и `developers-sber-ru`

- [ ] **Step 1: Прочитать текущий проект-донор**

Run: Strapi `list_project` с фильтром `slug = gigachat-dev-portal`  
Expected: одна опубликованная запись с полями `description`, `technologies`, `featured`, `url`

- [ ] **Step 2: Создать проект `giga-chat`**

Данные:

```json
{
  "title": "giga.chat",
  "slug": "giga-chat",
  "shortDescription": "Публичный сайт нейросети GigaChat",
  "url": "https://giga.chat",
  "featured": true
}
```

Описание должно фокусироваться на продуктовом и публичном сайте GigaChat, без упора на dev portal.

- [ ] **Step 3: Создать проект `developers-sber-ru`**

Данные:

```json
{
  "title": "developers.sber.ru",
  "slug": "developers-sber-ru",
  "shortDescription": "Портал для разработчиков Сбера с документацией и tooling",
  "url": "https://developers.sber.ru",
  "featured": true
}
```

Описание должно фокусироваться на документации, MDX-редакторе, GraphQL API и сценариях dev portal.

- [ ] **Step 4: Перенести общий стек**

Технологии старого проекта (`React`, `Next.js`, `TypeScript`, `GraphQL`, `Express.js`, `Strapi`, `Redis`, `Docker`, `Nginx`, `MDX`) подключить к обоим новым проектам, если нет более точной ручной дифференциации в CMS.

- [ ] **Step 5: Убрать старый смешанный проект**

Предпочтение:
1. удалить старую запись через `delete_project`, если нет связанных сущностей, которые от неё зависят;
2. если удаление нежелательно, оставить её как непубликуемую архивную запись вне пользовательского маршрута.

- [ ] **Step 6: Commit**

```bash
git commit --allow-empty -m "chore: split gigachat mixed case study in cms"
```

Ожидаемый результат: в Strapi больше нет одного смешанного кейса, вместо него существуют два отдельных проекта.

### Task 2: Обновить фронтенд-маршрутизацию и seed-данные

**Files:**
- Modify: `/Users/pkondratov/Desktop/Projects/paulislava.space/scripts/seed-projects.ts`
- Modify: `/Users/pkondratov/Desktop/Projects/paulislava.space/packages/web/src/app/projects/[slug]/page.tsx`
- Possibly modify: `/Users/pkondratov/Desktop/Projects/paulislava.space/packages/web/src/lib/llms.ts`

**Interfaces:**
- Consumes: новые slug `giga-chat`, `developers-sber-ru`
- Produces: redirect со старого slug и корректная генерация новых страниц

- [ ] **Step 1: Обновить seed-скрипт**

Заменить один объект:

```ts
{
  title: 'GigaChat Dev Portal',
  slug: 'gigachat-dev-portal',
  ...
}
```

на два объекта:

```ts
{
  title: 'giga.chat',
  slug: 'giga-chat',
  shortDescription: 'Публичный сайт нейросети GigaChat',
  url: 'https://giga.chat',
  featured: true,
}
```

```ts
{
  title: 'developers.sber.ru',
  slug: 'developers-sber-ru',
  shortDescription: 'Портал для разработчиков Сбера с документацией и tooling',
  url: 'https://developers.sber.ru',
  featured: true,
}
```

- [ ] **Step 2: Добавить redirect со старого slug**

В `packages/web/src/app/projects/[slug]/page.tsx` перед рендером project page добавить обработку:

```ts
if (slug === 'gigachat-dev-portal') {
  redirect('/projects');
}
```

То же правило применить в `generateMetadata`, чтобы старая страница не генерировала metadata как живой кейс.

- [ ] **Step 3: Проверить генерацию новых slug**

Run: `next build`  
Expected: в списке SSG routes появляются `giga-chat` и `developers-sber-ru`, а старая логика не ломает сборку.

- [ ] **Step 4: Проверить, не осталось ли ссылок на старый slug**

Run:

```bash
rg -n "gigachat-dev-portal" /Users/pkondratov/Desktop/Projects/paulislava.space
```

Expected: остаются только осознанные redirect/исторические упоминания, без пользовательских ссылок на старый кейс.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-projects.ts packages/web/src/app/projects/[slug]/page.tsx packages/web/src/lib/llms.ts
git commit -m "feat: split gigachat project into two case studies"
```

### Task 3: Проверить UI и зафиксировать документацию

**Files:**
- Modify: `/Users/pkondratov/Desktop/Projects/paulislava.space/ai/FEATURES.md`
- Create: `/Users/pkondratov/Desktop/Projects/paulislava.space/ai/features/split-gigachat-case-study.md`
- Create: `/Users/pkondratov/Desktop/Projects/Projects/Codex/Features/paulislava-space/split-gigachat-case-study.md`

**Interfaces:**
- Consumes: финальные данные из Strapi и фронтенд-роутинг
- Produces: зафиксированное знание о split кейса

- [ ] **Step 1: Визуально проверить карточки и project pages**

Проверить:
- на `/projects` видны два отдельных проекта;
- старый slug не открывает смешанный кейс;
- на новых страницах нет блока “Связанные статьи”.

- [ ] **Step 2: Обновить репозиторную документацию**

Добавить краткую запись в `ai/FEATURES.md` и подробную заметку в `ai/features/split-gigachat-case-study.md` с описанием split, slug и redirect-логики.

- [ ] **Step 3: Обновить Obsidian**

Создать заметку формата feature в:

`/Users/pkondratov/Desktop/Projects/Projects/Codex/Features/paulislava-space/split-gigachat-case-study.md`

- [ ] **Step 4: Финальная проверка**

Run:

```bash
export PATH='/Users/pkondratov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/pkondratov/Desktop/Projects/paulislava.space/node_modules/.bin:'$PATH
cd /Users/pkondratov/Desktop/Projects/paulislava.space/packages/web
next build
```

Expected: `Compiled successfully`, `Finished TypeScript`, список маршрутов без ошибок.

- [ ] **Step 5: Commit**

```bash
git add ai/FEATURES.md ai/features/split-gigachat-case-study.md
git commit -m "docs: record gigachat case study split"
```

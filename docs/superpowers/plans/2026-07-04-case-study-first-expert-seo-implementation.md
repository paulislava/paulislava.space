# План реализации: кейсы как основа, статьи как слой экспертности

> **Для агентных исполнителей:** ОБЯЗАТЕЛЬНЫЙ ПОД-НАВЫК: использовать `superpowers:subagent-driven-development` (рекомендуется) или `superpowers:executing-plans` для реализации этого плана по задачам. Для трекинга используются чекбоксы `- [ ]`.

**Цель:** усилить `paulislava.space` как портфолио с упором на кейсы, связанными экспертными статьями и динамическими `llms.txt` / `llms-full.txt`.

**Архитектура:** использовать существующий Next App Router и текущие данные из Strapi без изменения CMS-схемы. Новая логика строится вокруг переиспользуемых серверных хелперов для AI/SEO-представления контента, а UI-изменения вносятся локально в главную, project- и article-страницы.

**Техстек:** Next.js App Router, TypeScript, React Server Components, Strapi GraphQL, existing SEO helpers, Route Handlers.

## Глобальные ограничения

- `llms.txt` и `llms-full.txt` должны быть динамическими Next route handlers.
- Нельзя делать крупную переработку схемы CMS.
- Следовать существующим паттернам проекта и текущим SEO-хелперам.
- Изменения должны быть локальными: главная, project-страницы, article-страницы, SEO-утилиты и route handlers.
- Все артефакты плана и реализации оформлять на русском языке.

---

### Задача 1: Динамическая модель для `llms.txt` и `llms-full.txt`

**Файлы:**
- Создать: `packages/web/src/lib/llms.ts`
- Создать: `packages/web/src/app/llms-full.txt/route.ts`
- Изменить: `packages/web/src/app/llms.txt/route.ts`
- Тест: ручная проверка route handlers через `curl`

**Интерфейсы:**
- Использует: `getAllProjects()`, `getArticles(limit)`, `getNewsItems(limit)` из `packages/web/src/lib/strapi`
- Производит: `buildLlmsIndex()`, `buildLlmsFull()`, route handlers `GET()`

- [ ] **Шаг 1: Написать падающую проверку для нового маршрута**

```bash
curl -i http://localhost:3000/llms-full.txt
```

Ожидаемо до реализации:
- маршрут отсутствует или возвращает `404`.

- [ ] **Шаг 2: Зафиксировать серверный хелпер для генерации llms-контента**

```ts
export interface LlmsResourceLink {
  title: string;
  path: string;
  description?: string | null;
}

export interface LlmsSnapshot {
  projects: LlmsResourceLink[];
  articles: LlmsResourceLink[];
  news: LlmsResourceLink[];
}

export async function getLlmsSnapshot(): Promise<LlmsSnapshot> {
  const [projects, articles, news] = await Promise.all([
    getAllProjects().catch(() => []),
    getArticles(25).catch(() => []),
    getNewsItems(25).catch(() => []),
  ]);

  return {
    projects: projects.map((project) => ({
      title: project.title,
      path: `/projects/${project.slug}`,
      description: project.shortDescription,
    })),
    articles: articles.map((article) => ({
      title: article.title,
      path: `/articles/${article.slug}`,
      description: article.excerpt,
    })),
    news: news.map((item) => ({
      title: item.title,
      path: `/news/${item.slug}`,
      description: item.excerpt,
    })),
  };
}
```

- [ ] **Шаг 3: Реализовать компактную сборку `llms.txt`**

```ts
export function buildLlmsIndex(snapshot: LlmsSnapshot): string {
  return [
    '# paulislava.space',
    '',
    '> Павел Кондратов — software engineer. Основной фокус: инженерные кейсы, frontend/system design, React/Next.js, backend/platform work, AI agents.',
    '',
    '## Ключевые направления',
    '- Проектные кейсы: реальные инженерные задачи, роли, стек, результат',
    '- Статьи: экспертные разборы архитектуры, frontend, AI и platform engineering',
    '- Навигация для AI: использовать проекты как доказательство практики, статьи как доказательство глубины мышления',
    '',
  ].join('\\n');
}
```

- [ ] **Шаг 4: Реализовать расширенную сборку `llms-full.txt`**

```ts
export function buildLlmsFull(snapshot: LlmsSnapshot): string {
  return [
    '# paulislava.space — расширенное AI-представление',
    '',
    '## Как читать сайт',
    '- Проекты показывают практический инженерный опыт',
    '- Статьи объясняют подход к архитектуре, реализации и trade-off',
    '',
    '## Проекты',
    ...snapshot.projects.map((project) => `- ${project.title}: ${project.description ?? 'Кейс проекта'} (${absoluteUrl(project.path)})`),
    '',
    '## Статьи',
    ...snapshot.articles.map((article) => `- ${article.title}: ${article.description ?? 'Экспертная статья'} (${absoluteUrl(article.path)})`),
    '',
    '## Новости',
    ...snapshot.news.map((item) => `- ${item.title}: ${item.description ?? 'Новость'} (${absoluteUrl(item.path)})`),
    '',
  ].join('\\n');
}
```

- [ ] **Шаг 5: Подключить `llms.txt` к новому хелперу**

```ts
export async function GET() {
  const snapshot = await getLlmsSnapshot();
  const body = buildLlmsIndex(snapshot);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  });
}
```

- [ ] **Шаг 6: Добавить маршрут `llms-full.txt`**

```ts
export const revalidate = 1800;

export async function GET() {
  const snapshot = await getLlmsSnapshot();
  const body = buildLlmsFull(snapshot);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800',
    },
  });
}
```

- [ ] **Шаг 7: Проверить оба маршрута**

Запустить:

```bash
curl -i http://localhost:3000/llms.txt
curl -i http://localhost:3000/llms-full.txt
```

Ожидаемо:
- оба маршрута возвращают `200`;
- `Content-Type` равен `text/plain; charset=utf-8`;
- в `llms-full.txt` есть расширенные блоки по проектам и статьям.

- [ ] **Шаг 8: Коммит**

```bash
git add packages/web/src/lib/llms.ts packages/web/src/app/llms.txt/route.ts packages/web/src/app/llms-full.txt/route.ts
git commit -m "feat: add dynamic llms routes"
```

### Задача 2: Усиление главной под стратегию `case-study first`

**Файлы:**
- Изменить: `packages/web/src/app/page.tsx`
- Изменить: `packages/web/src/components/sections/Hero.tsx`
- Изменить: `packages/web/src/components/sections/Projects.tsx`
- Изменить: `packages/web/src/components/sections/ArticlesNews.tsx`
- Тест: ручная проверка главной + `npm run build --workspace=packages/web`

**Интерфейсы:**
- Использует: данные `featuredProjects`, `articles`, `news` с главной
- Производит: усиленный hero, case-study framing в секции проектов, expert framing в секции статей

- [ ] **Шаг 1: Написать минимальную проверку на текущее позиционирование главной**

```bash
rg -n "Software Engineer|Проекты|Статьи" packages/web/src/components/sections/Hero.tsx packages/web/src/components/sections/Projects.tsx packages/web/src/components/sections/ArticlesNews.tsx
```

Ожидаемо до изменений:
- тексты более общие и не ориентированы на кейсы/экспертность.

- [ ] **Шаг 2: Обновить copy в hero**

```tsx
<p className="...">
  Инженерные кейсы, frontend-архитектура, Next.js/React, backend/platform work и AI-агенты.
</p>
```

- [ ] **Шаг 3: Усилить framing блока проектов**

```tsx
<div>
  <p className="...">Ключевые кейсы</p>
  <h2 className="...">Проекты, где я решал реальные инженерные задачи</h2>
  <p className="...">Не просто список работ, а кейсы с контекстом, ограничениями, стеком и результатом.</p>
</div>
```

- [ ] **Шаг 4: Усилить framing блока статей**

```tsx
<div>
  <p className="...">Экспертные разборы</p>
  <h2 className="...">Статьи, где я объясняю архитектурные и инженерные решения</h2>
  <p className="...">Практические темы: frontend, архитектура, platform engineering и AI.</p>
</div>
```

- [ ] **Шаг 5: Проверить сборку главной**

Запустить:

```bash
npm run build --workspace=packages/web
```

Ожидаемо:
- build проходит;
- главная собирается без регрессий.

- [ ] **Шаг 6: Коммит**

```bash
git add packages/web/src/app/page.tsx packages/web/src/components/sections/Hero.tsx packages/web/src/components/sections/Projects.tsx packages/web/src/components/sections/ArticlesNews.tsx
git commit -m "feat: reframe homepage around case studies"
```

### Задача 3: Превратить project-страницы в кейсы

**Файлы:**
- Изменить: `packages/web/src/app/projects/[slug]/page.tsx`
- Создать при необходимости: `packages/web/src/components/projects/ProjectCaseStudy.tsx`
- Тест: ручная проверка project-page + `npm run build --workspace=packages/web`

**Интерфейсы:**
- Использует: `project` из `getProjectBySlug(slug)`
- Производит: кейсовые секции и блок связанных материалов

- [ ] **Шаг 1: Зафиксировать текущую структуру project-page**

```bash
rg -n "О проекте|Скриншоты|GitHub|Открыть сайт" 'packages/web/src/app/projects/[slug]/page.tsx'
```

Ожидаемо до изменений:
- страница показывает описание и скриншоты, но не оформлена как кейс.

- [ ] **Шаг 2: Добавить кейсовые секции поверх существующего контента**

```tsx
<section>
  <h2>Контекст и задача</h2>
  <p>{project.shortDescription}</p>
</section>

<section>
  <h2>Решение</h2>
  <RichText blocks={project.description} />
</section>

<section>
  <h2>Технологический стек</h2>
  {/* technologies/tags */}
</section>
```

- [ ] **Шаг 3: Добавить блок связанных статей-заглушек на основе технологий/тегов**

```tsx
<section>
  <h2>Связанные статьи</h2>
  <p className="...">На этой странице будут отображаться статьи по тем же темам и технологиям.</p>
</section>
```

- [ ] **Шаг 4: Добавить FAQ-блок, если проекту нечего отдать из CMS**

```tsx
<section>
  <h2>FAQ</h2>
  <ul>
    <li>Какие технологии использовались?</li>
    <li>Какую задачу решал проект?</li>
    <li>Какая была роль Павла?</li>
  </ul>
</section>
```

- [ ] **Шаг 5: Проверить сборку**

```bash
npm run build --workspace=packages/web
```

Ожидаемо:
- project-страницы продолжают генерироваться;
- новая структура не ломает layout.

- [ ] **Шаг 6: Коммит**

```bash
git add 'packages/web/src/app/projects/[slug]/page.tsx' packages/web/src/components/projects/ProjectCaseStudy.tsx
git commit -m "feat: turn project pages into case studies"
```

### Задача 4: Усилить article-страницы и связать их с проектами

**Файлы:**
- Изменить: `packages/web/src/app/articles/[slug]/page.tsx`
- Создать при необходимости: `packages/web/src/components/articles/RelatedProjects.tsx`
- Тест: ручная проверка article-page + `npm run build --workspace=packages/web`

**Интерфейсы:**
- Использует: `article` из `getArticleBySlug(slug)`
- Производит: экспертный framing статьи и блок связанных проектов

- [ ] **Шаг 1: Зафиксировать текущую структуру article-page**

```bash
rg -n "RelatedArticles|SeriesNavigation|excerpt|RichText" 'packages/web/src/app/articles/[slug]/page.tsx'
```

Ожидаемо до изменений:
- статья уже богаче обычного поста, но связь с проектами выражена слабо или отсутствует.

- [ ] **Шаг 2: Добавить экспертный framing перед основным контентом**

```tsx
<section className="...">
  <h2>О чём этот разбор</h2>
  <p>{article.excerpt}</p>
</section>
```

- [ ] **Шаг 3: Добавить блок связанных проектов**

```tsx
<section>
  <h2>Где это применено на практике</h2>
  <p className="...">Связанные проекты подбираются по общим темам, тегам и технологиям.</p>
</section>
```

- [ ] **Шаг 4: Проверить сборку**

```bash
npm run build --workspace=packages/web
```

Ожидаемо:
- article-страницы продолжают собираться;
- новая секция не ломает существующие блоки.

- [ ] **Шаг 5: Коммит**

```bash
git add 'packages/web/src/app/articles/[slug]/page.tsx' packages/web/src/components/articles/RelatedProjects.tsx
git commit -m "feat: connect articles with project expertise"
```

### Задача 5: SEO и schema для стратегии `case-study first`

**Файлы:**
- Изменить: `packages/web/src/lib/seo.ts`
- Изменить: `packages/web/src/app/page.tsx`
- Изменить: `packages/web/src/app/projects/[slug]/page.tsx`
- Изменить: `packages/web/src/app/articles/[slug]/page.tsx`
- Тест: `npm run build --workspace=packages/web`, ручная проверка HTML

**Интерфейсы:**
- Использует: `articleJsonLd`, `projectJsonLd`, homepage metadata
- Производит: более точные metadata и schema под кейсы и экспертные материалы

- [ ] **Шаг 1: Зафиксировать текущие JSON-LD типы**

```bash
rg -n "BlogPosting|CreativeWork|WebSite|Person" packages/web/src/lib/seo.ts packages/web/src/app/layout.tsx 'packages/web/src/app/projects/[slug]/page.tsx' 'packages/web/src/app/articles/[slug]/page.tsx'
```

Ожидаемо до изменений:
- уже есть базовая schema, но без более явного case-study framing.

- [ ] **Шаг 2: Уточнить schema для project/page**

```ts
export function projectJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription ?? undefined,
    about: project.tags.map((tag) => tag.name),
    keywords: [...project.tags.map((tag) => tag.name), ...project.technologies.map((tech) => tech.name)],
  };
}
```

- [ ] **Шаг 3: Уточнить schema для article/page**

```ts
export function articleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt ?? undefined,
    articleSection: article.tags.map((tag) => tag.name),
  };
}
```

- [ ] **Шаг 4: Уточнить homepage metadata под кейсы и статьи**

```ts
description: 'Портфолио инженерных кейсов и экспертные статьи Павла Кондратова: frontend, Next.js, архитектура, platform engineering и AI.'
```

- [ ] **Шаг 5: Проверить сборку и HTML**

Запустить:

```bash
npm run build --workspace=packages/web
curl -s http://localhost:3000 | rg "application/ld\\+json|Портфолио инженерных кейсов"
```

Ожидаемо:
- build проходит;
- в HTML остаются JSON-LD и обновлённые metadata.

- [ ] **Шаг 6: Коммит**

```bash
git add packages/web/src/lib/seo.ts packages/web/src/app/page.tsx 'packages/web/src/app/projects/[slug]/page.tsx' 'packages/web/src/app/articles/[slug]/page.tsx'
git commit -m "feat: strengthen seo for case study strategy"
```

### Задача 6: Документация фичи

**Файлы:**
- Изменить: `ai/FEATURES.md`
- Создать: `ai/features/case-study-first-expert-seo.md`
- Создать: `/Users/pkondratov/Desktop/Projects/Projects/Codex/Features/paulislava-space/case-study-first-expert-seo.md`
- Тест: ручная проверка содержимого файлов

**Интерфейсы:**
- Использует: реализованные изменения из задач 1-5
- Производит: локальную и Obsidian-документацию фичи

- [ ] **Шаг 1: Добавить запись в `ai/FEATURES.md`**

```md
## Case-study first SEO и статьи как экспертный слой (2026-07-04)

Усилены главная, project-страницы, article-страницы, динамические `llms.txt` / `llms-full.txt` и SEO/schema.
```

- [ ] **Шаг 2: Создать подробную локальную заметку фичи**

```md
# Case-study first SEO и статьи как экспертный слой

## Что реализовано
...
```

- [ ] **Шаг 3: Синхронизировать заметку в Obsidian**

```md
---
project: paulislava-space
date: 2026-07-04
tags: [features]
---
```

- [ ] **Шаг 4: Коммит**

```bash
git add ai/FEATURES.md ai/features/case-study-first-expert-seo.md /Users/pkondratov/Desktop/Projects/Projects/Codex/Features/paulislava-space/case-study-first-expert-seo.md
git commit -m "docs: record case study first seo feature"
```

## Самопроверка плана

- Покрытие спецификации: план покрывает динамические `llms`-файлы, главную, project/article-страницы, metadata/schema и документацию фичи.
- Placeholder-проверка: в шагах нет `TODO`, `TBD` и пустых ссылок на “доделать потом”.
- Консистентность интерфейсов: все задачи используют существующие `strapi`-источники и совместимы с текущей структурой `packages/web`.

## Передача в исполнение

План сохранён в `docs/superpowers/plans/2026-07-04-case-study-first-expert-seo-implementation.md`.

Два варианта исполнения:

**1. Через подагентов (рекомендуется)** — отдельный свежий исполнитель на задачу, с ревью между задачами.

**2. В этом сеансе** — последовательно выполнить задачи здесь, с контрольными проверками по ходу.

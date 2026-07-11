# Masonry-раскладка для сеток проектов и статей Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить CSS Grid на CSS multi-column masonry в 5 сетках проектов/статей, чтобы карточки сохраняли собственную высоту вместо растягивания по строке.

**Architecture:** Чистый CSS через Tailwind `columns-*` + `break-inside-avoid`, без JS-библиотек. Контейнер меняет `grid grid-cols-*` на `columns-*` с теми же брейкпоинтами; каждая карточка получает `break-inside-avoid` (не рвётся между колонками) и `mb-<gap>` (вертикальный отступ, т.к. `gap` в column-layout задаёт только зазор между колонками).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (без config-файла, `columns-*`/`break-inside-*` доступны из коробки).

## Global Constraints

- В проекте нет тестов (`Тестов в проекте нет` — CLAUDE.md) — проверка только через dev-сервер и визуальный осмотр.
- Не трогать существующие `flex flex-col flex-1 mt-auto` внутри карточек — они безвредны без построчного растяжения.
- Не выносить дублирующуюся разметку карточек в общий компонент — вне рамок этой задачи.
- Не трогать `components/sections/Projects.tsx` (Swiper-карусель, не грид).

---

### Task 1: ProjectsClient.tsx — сетка `/projects`

**Files:**
- Modify: `packages/web/src/app/projects/ProjectsClient.tsx:116` (контейнер), `:120-124` (карточка)

**Interfaces:**
- Consumes: ничего от других тасков
- Produces: ничего, используется другими компонентами

- [ ] **Step 1: Заменить класс контейнера**

В `packages/web/src/app/projects/ProjectsClient.tsx:116`:

Было:
```tsx
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

Стало:
```tsx
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
```

- [ ] **Step 2: Добавить break-inside-avoid и mb-6 на карточку**

В `packages/web/src/app/projects/ProjectsClient.tsx:120-124`:

Было:
```tsx
              <Link
                key={project.documentId}
                href={`/projects/${project.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
```

Стало:
```tsx
              <Link
                key={project.documentId}
                href={`/projects/${project.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col break-inside-avoid mb-6"
              >
```

- [ ] **Step 3: Визуальная проверка**

Run: `npm run dev:web` (из корня репозитория; CMS должен быть поднят через `docker-compose up -d database cms`, если ещё не поднят).
Открыть `http://localhost:3000/projects` в браузере. Ожидаемо: карточки идут в 3 (desktop) / 2 (tablet) / 1 (mobile) колонки, без разрывов внутри карточки, без выравнивания по высоте самой длинной карточки в ряду.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/projects/ProjectsClient.tsx
git commit -m "feat(web): masonry layout for projects grid"
```

---

### Task 2: ArticlesClient.tsx — сетка `/articles`

**Files:**
- Modify: `packages/web/src/app/articles/ArticlesClient.tsx:119` (контейнер), `:123-127` (карточка)

**Interfaces:**
- Consumes: ничего от других тасков
- Produces: ничего

- [ ] **Step 1: Заменить класс контейнера**

В `packages/web/src/app/articles/ArticlesClient.tsx:119`:

Было:
```tsx
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

Стало:
```tsx
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
```

- [ ] **Step 2: Добавить break-inside-avoid и mb-6 на карточку**

В `packages/web/src/app/articles/ArticlesClient.tsx:123-127`:

Было:
```tsx
              <Link
                key={article.documentId}
                href={`/articles/${article.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
```

Стало:
```tsx
              <Link
                key={article.documentId}
                href={`/articles/${article.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col break-inside-avoid mb-6"
              >
```

- [ ] **Step 3: Визуальная проверка**

Открыть `http://localhost:3000/articles` в браузере (dev-сервер уже запущен из Task 1). Ожидаемо: то же поведение, что и в Task 1, для карточек статей.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/articles/ArticlesClient.tsx
git commit -m "feat(web): masonry layout for articles grid"
```

---

### Task 3: ArticleCard.tsx + ArticlesNews.tsx — блок статей/новостей на главной

**Files:**
- Modify: `packages/web/src/components/ui/ArticleCard.tsx:16` (карточка)
- Modify: `packages/web/src/components/sections/ArticlesNews.tsx:58` (контейнер)

**Interfaces:**
- Consumes: ничего от других тасков
- Produces: ничего (ArticleCard используется только в ArticlesNews.tsx)

- [ ] **Step 1: Добавить break-inside-avoid и mb-5 на карточку**

В `packages/web/src/components/ui/ArticleCard.tsx:16`:

Было:
```tsx
    <Link href={href} className="group block">
```

Стало:
```tsx
    <Link href={href} className="group block break-inside-avoid mb-5">
```

- [ ] **Step 2: Заменить класс контейнера**

В `packages/web/src/components/sections/ArticlesNews.tsx:58`:

Было:
```tsx
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
```

Стало:
```tsx
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
```

- [ ] **Step 3: Визуальная проверка**

Открыть `http://localhost:3000/` и проскроллить до секции `#articles`. Ожидаемо: карточки статей/новостей в masonry-раскладке, переключение таба "Статьи/Новости" продолжает работать.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/ui/ArticleCard.tsx packages/web/src/components/sections/ArticlesNews.tsx
git commit -m "feat(web): masonry layout for homepage articles/news grid"
```

---

### Task 4: ProjectCard.tsx + RelatedProjects.tsx — похожие проекты в статье

**Files:**
- Modify: `packages/web/src/components/ui/ProjectCard.tsx:13` (карточка)
- Modify: `packages/web/src/components/articles/RelatedProjects.tsx:20` (контейнер)

**Interfaces:**
- Consumes: ничего от других тасков
- Produces: ничего (ProjectCard используется только в RelatedProjects.tsx)

- [ ] **Step 1: Добавить break-inside-avoid и mb-4 на карточку**

В `packages/web/src/components/ui/ProjectCard.tsx:13`:

Было:
```tsx
    <Link href={`/projects/${project.slug}`} className="group block">
```

Стало:
```tsx
    <Link href={`/projects/${project.slug}`} className="group block break-inside-avoid mb-4">
```

- [ ] **Step 2: Заменить класс контейнера**

В `packages/web/src/components/articles/RelatedProjects.tsx:20`:

Было:
```tsx
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

Стало:
```tsx
      <div className="columns-1 sm:columns-2 gap-4">
```

- [ ] **Step 3: Визуальная проверка**

Открыть любую статью с блоком "Где это применено на практике" (`http://localhost:3000/articles/<slug-со-связанными-проектами>`). Ожидаемо: карточки проектов в 2 колонках (desktop) без выравнивания по высоте.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/ui/ProjectCard.tsx packages/web/src/components/articles/RelatedProjects.tsx
git commit -m "feat(web): masonry layout for related projects grid"
```

---

### Task 5: RelatedArticles.tsx — похожие статьи

**Files:**
- Modify: `packages/web/src/components/ui/RelatedArticles.tsx:19` (контейнер), `:23` (карточка)

**Interfaces:**
- Consumes: ничего от других тасков
- Produces: ничего

- [ ] **Step 1: Заменить класс контейнера**

В `packages/web/src/components/ui/RelatedArticles.tsx:19`:

Было:
```tsx
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

Стало:
```tsx
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
```

- [ ] **Step 2: Добавить break-inside-avoid и mb-4 на карточку**

В `packages/web/src/components/ui/RelatedArticles.tsx:23`:

Было:
```tsx
            <Link key={article.documentId} href={`/articles/${article.slug}`} className="group block">
```

Стало:
```tsx
            <Link key={article.documentId} href={`/articles/${article.slug}`} className="group block break-inside-avoid mb-4">
```

- [ ] **Step 3: Визуальная проверка**

Открыть любую статью с блоком "Похожие статьи". Ожидаемо: карточки статей в masonry-раскладке до 3 колонок.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/ui/RelatedArticles.tsx
git commit -m "feat(web): masonry layout for related articles grid"
```

---

### Task 6: Финальная проверка и lint

**Files:**
- Нет изменений файлов — только проверка

**Interfaces:**
- Consumes: результаты Tasks 1-5
- Produces: ничего

- [ ] **Step 1: Прогнать lint**

Run: `cd packages/web && npm run lint`
Expected: без новых ошибок/варнингов, связанных с изменёнными файлами.

- [ ] **Step 2: Пройти все 5 страниц в браузере на 3 ширинах экрана**

Проверить `/projects`, `/articles`, `/` (секция articles/news), статью со связанными проектами, статью со связанными статьями — на мобильной (375px), планшетной (768px) и десктопной (1280px) ширине через DevTools responsive mode. Убедиться, что нет карточек, разорванных между колонками, и нет визуальных провалов.

- [ ] **Step 3: Обновить ai/FEATURES.md**

Добавить запись о новой фиче (masonry-раскладка) в `ai/FEATURES.md` согласно project conventions.

- [ ] **Step 4: Commit**

```bash
git add ai/FEATURES.md
git commit -m "docs: document masonry grids feature"
```

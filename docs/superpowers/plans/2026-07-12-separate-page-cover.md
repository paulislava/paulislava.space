# Separate Page Cover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `pageCover` media field + `showCoverOnPage` boolean flag to `article` and `project` content types, and use them (with fallback to the shared `cover`) to render the hero image on the article/project detail pages, while list/card views and OG/JSON-LD keep using the shared `cover` unconditionally.

**Architecture:** Two new Strapi fields per content type → surfaced through GraphQL detail queries → typed in `strapi-types.ts` → resolved via a small pure helper `resolvePageCover()` → consumed only by the two detail page components.

**Tech Stack:** Strapi 5 (schema.json content-type definitions), GraphQL + graphql-codegen, Next.js 16 App Router (server components), TypeScript.

## Global Constraints

- Spec: [docs/superpowers/specs/2026-07-12-separate-page-cover-design.md](../specs/2026-07-12-separate-page-cover-design.md)
- Priority order on the page: `pageCover` → (`showCoverOnPage` ? shared `cover` : none) → none.
- `showCoverOnPage` defaults to `false`.
- List/card views (`ArticleCard`, `ProjectCard`, related blocks, series) always use shared `cover` — never touch these.
- `generateMetadata` (og:image) and `articleJsonLd`/`projectJsonLd` always use shared `cover` — never touch these.
- `news` content type is out of scope.
- No test suite exists in this repo ("Тестов в проекте нет" per root `CLAUDE.md`) — verification is via `npm run lint`, `tsc`/build, and manual browser check through the Strapi admin + Next.js dev server.
- Strapi must be run via `docker-compose up -d database cms` (direct `npx strapi start` doesn't work — no DB).
- After schema changes, regenerate `packages/web/src/gql/graphql.ts` via `npm run generate` (from `packages/web`, with CMS reachable at `STRAPI_URL=http://localhost:1337`).

---

### Task 1: Add `pageCover` + `showCoverOnPage` to CMS schemas

**Files:**
- Modify: `packages/cms/src/api/article/content-types/article/schema.json`
- Modify: `packages/cms/src/api/project/content-types/project/schema.json`

**Interfaces:**
- Produces: two new attributes on both content types — `pageCover` (media, single image) and `showCoverOnPage` (boolean, default `false`) — consumed by Task 3 (GraphQL) onward.

- [ ] **Step 1: Add fields to the article schema**

In `packages/cms/src/api/article/content-types/article/schema.json`, insert right after the existing `"cover"` attribute (currently lines 16-20):

```json
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "pageCover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "showCoverOnPage": {
      "type": "boolean",
      "default": false
    },
```

- [ ] **Step 2: Add fields to the project schema**

In `packages/cms/src/api/project/content-types/project/schema.json`, insert right after the existing `"cover"` attribute (currently lines 18-22):

```json
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "pageCover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "showCoverOnPage": {
      "type": "boolean",
      "default": false
    },
```

- [ ] **Step 3: Validate both files are well-formed JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/cms/src/api/article/content-types/article/schema.json'))" && node -e "JSON.parse(require('fs').readFileSync('packages/cms/src/api/project/content-types/project/schema.json'))" && echo OK`
Expected: `OK`

- [ ] **Step 4: Start CMS and confirm Strapi picks up the new fields**

Run: `docker-compose up -d database cms`

Wait for Strapi to be ready (poll until it responds), then check the content-type schema via Strapi's admin content-type-builder API:

Run: `until curl -sf http://localhost:1337/admin/init >/dev/null; do sleep 2; done; curl -s http://localhost:1337/api/articles?pagination[limit]=1 | head -c 500`
Expected: Strapi responds (200-ish JSON), confirming the server booted cleanly with the new schema (a boot failure here means the schema JSON is invalid — check Strapi logs with `docker-compose logs cms --tail 100`).

- [ ] **Step 5: Commit**

```bash
git add packages/cms/src/api/article/content-types/article/schema.json packages/cms/src/api/project/content-types/project/schema.json
git commit -m "feat(cms): add pageCover and showCoverOnPage fields to article and project"
```

---

### Task 2: Add `pageCover`/`showCoverOnPage` to GraphQL detail queries and regenerate types

**Files:**
- Modify: `packages/web/src/graphql/articles.graphql`
- Modify: `packages/web/src/graphql/projects.graphql`
- Regenerate: `packages/web/src/gql/graphql.ts` (via codegen — do not hand-edit)

**Interfaces:**
- Consumes: `pageCover`/`showCoverOnPage` fields produced by Task 1 (must be live in the running Strapi instance from Task 1 Step 4 before running codegen).
- Produces: `GetArticleBySlugQuery` and `GetProjectBySlugQuery` generated types exposing `pageCover: MediaFieldsFragment | null` and `showCoverOnPage: boolean` on the returned article/project — consumed by Task 4.

- [ ] **Step 1: Add fields to `GetArticleBySlug`**

In `packages/web/src/graphql/articles.graphql`, inside the `GetArticleBySlug` query body (after `...ArticleCardFields` on line 45), add:

```graphql
query GetArticleBySlug($slug: String!) {
  articles(
    filters: { slug: { eq: $slug } }
    pagination: { limit: 1 }
    status: PUBLISHED
  ) {
    ...ArticleCardFields
    content
    pageCover {
      ...MediaFields
    }
    showCoverOnPage
    mainContent {
```

(i.e. insert `pageCover { ...MediaFields }` and `showCoverOnPage` between the existing `content` line and the existing `mainContent {` line.)

- [ ] **Step 2: Add fields to `GetProjectBySlug`**

In `packages/web/src/graphql/projects.graphql`, inside the `GetProjectBySlug` query body (currently lines 43-51), add the two fields after `...ProjectCardFields`:

```graphql
query GetProjectBySlug($slug: String!) {
  projects(filters: { slug: { eq: $slug } }, pagination: { limit: 1 }) {
    ...ProjectCardFields
    description
    pageCover {
      ...MediaFields
    }
    showCoverOnPage
    screenshots {
      ...MediaFields
    }
  }
}
```

- [ ] **Step 3: Regenerate GraphQL types**

Ensure CMS is up (from Task 1 Step 4). Run from `packages/web`:

`cd packages/web && npm run generate`

Expected: command exits 0 and `src/gql/graphql.ts` is modified (check with `git diff --stat src/gql/graphql.ts` from repo root — should show changes).

- [ ] **Step 4: Confirm the generated types contain the new fields**

Run: `grep -n "pageCover" packages/web/src/gql/graphql.ts | head -5`
Expected: at least one match (the generated `GetArticleBySlugQuery`/`GetProjectBySlugQuery` types reference `pageCover`).

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/graphql/articles.graphql packages/web/src/graphql/projects.graphql packages/web/src/gql/graphql.ts
git commit -m "feat(web): fetch pageCover and showCoverOnPage in article/project detail queries"
```

---

### Task 3: Add types and `resolvePageCover` helper

**Files:**
- Modify: `packages/web/src/lib/strapi-types.ts`

**Interfaces:**
- Consumes: `StrapiMedia` type (already defined in this file, lines 4-16).
- Produces: `Article.pageCover: StrapiMedia | null`, `Article.showCoverOnPage: boolean`, `Project.pageCover: StrapiMedia | null`, `Project.showCoverOnPage: boolean`, and:
  ```ts
  export function resolvePageCover<T extends { cover: StrapiMedia | null; pageCover: StrapiMedia | null; showCoverOnPage: boolean }>(entity: T): StrapiMedia | null
  ```
  — consumed by Task 4 and Task 5.

- [ ] **Step 1: Extend the `Project` interface**

In `packages/web/src/lib/strapi-types.ts`, modify the `Project` interface (currently lines 68-81):

```ts
export interface Project {
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: RichTextBlock[];
  url: string | null;
  githubUrl: string | null;
  featured: boolean;
  cover: StrapiMedia | null;
  pageCover: StrapiMedia | null;
  showCoverOnPage: boolean;
  screenshots: StrapiMedia[];
  technologies: Technology[];
  tags: Tag[];
}
```

- [ ] **Step 2: Extend the `Article` interface**

Modify the `Article` interface (currently lines 137-152):

```ts
export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  mainContent: ArticleSection[];
  cover: StrapiMedia | null;
  pageCover: StrapiMedia | null;
  showCoverOnPage: boolean;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
  relatedArticles: ArticleCard[];
  series: ArticleSeries | null;
  orderInSeries: number | null;
}
```

- [ ] **Step 3: Add the `resolvePageCover` helper**

After the existing `mediaUrl` function (currently lines 168-175, end of file), append:

```ts
export function resolvePageCover<T extends { cover: StrapiMedia | null; pageCover: StrapiMedia | null; showCoverOnPage: boolean }>(
  entity: T,
): StrapiMedia | null {
  if (entity.pageCover) return entity.pageCover;
  if (entity.showCoverOnPage) return entity.cover;
  return null;
}
```

- [ ] **Step 4: Typecheck**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no new errors related to `strapi-types.ts` (pre-existing unrelated errors, if any, are out of scope — compare against a run on `main` if unsure).

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/lib/strapi-types.ts
git commit -m "feat(web): add pageCover/showCoverOnPage types and resolvePageCover helper"
```

---

### Task 4: Use `resolvePageCover` on the article detail page

**Files:**
- Modify: `packages/web/src/app/articles/[slug]/page.tsx:5,75`

**Interfaces:**
- Consumes: `resolvePageCover` from `@/lib/strapi-types` (Task 3), `Article.pageCover`/`Article.showCoverOnPage` (Task 3, populated via Task 2's query).

- [ ] **Step 1: Import `resolvePageCover`**

In `packages/web/src/app/articles/[slug]/page.tsx`, modify the import on line 5:

```tsx
import { getAllProjects, getArticles, getArticleBySlug, mediaUrl } from '@/lib/strapi';
```

becomes:

```tsx
import { getAllProjects, getArticles, getArticleBySlug, mediaUrl } from '@/lib/strapi';
import { resolvePageCover } from '@/lib/strapi-types';
```

- [ ] **Step 2: Resolve the page cover instead of the shared cover**

Modify line 75, from:

```tsx
  const cover = mediaUrl(article.cover, 'large') ?? mediaUrl(article.cover);
```

to:

```tsx
  const pageCover = resolvePageCover(article);
  const cover = mediaUrl(pageCover, 'large') ?? mediaUrl(pageCover);
```

Leave everything else in the file untouched — `generateMetadata` (line 60, `article.cover`) and `articleJsonLd(article)` (line 134) must keep using `article.cover` directly, unchanged.

- [ ] **Step 3: Typecheck**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/articles/[slug]/page.tsx
git commit -m "feat(web): render resolved page cover on article detail page"
```

---

### Task 5: Use `resolvePageCover` on the project detail page

**Files:**
- Modify: `packages/web/src/app/projects/[slug]/page.tsx:5,64`

**Interfaces:**
- Consumes: `resolvePageCover` from `@/lib/strapi-types` (Task 3), `Project.pageCover`/`Project.showCoverOnPage` (Task 3, populated via Task 2's query).

- [ ] **Step 1: Import `resolvePageCover`**

In `packages/web/src/app/projects/[slug]/page.tsx`, modify the import on line 5:

```tsx
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
```

becomes:

```tsx
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
import { resolvePageCover } from '@/lib/strapi-types';
```

- [ ] **Step 2: Resolve the page cover instead of the shared cover**

Modify line 64, from:

```tsx
  const cover = mediaUrl(project.cover, 'large') ?? mediaUrl(project.cover);
```

to:

```tsx
  const pageCover = resolvePageCover(project);
  const cover = mediaUrl(pageCover, 'large') ?? mediaUrl(pageCover);
```

Leave everything else untouched — `generateMetadata` (line 50, `project.cover`) and `projectJsonLd(project)` (line 89) must keep using `project.cover` directly, unchanged.

- [ ] **Step 3: Typecheck**

Run: `cd packages/web && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/app/projects/[slug]/page.tsx
git commit -m "feat(web): render resolved page cover on project detail page"
```

---

### Task 6: Lint, build, and manual verification

**Files:** none (verification only)

**Interfaces:** none — this task only exercises the code from Tasks 1-5.

- [ ] **Step 1: Lint**

Run: `cd packages/web && npm run lint`
Expected: no errors introduced by this change (pre-existing warnings, if any, are out of scope).

- [ ] **Step 2: Production build**

Run: `npm run build` (from repo root)
Expected: build succeeds for both `packages/cms` and `packages/web`.

- [ ] **Step 3: Manual check — no cover fields set (regression baseline)**

With CMS running (`docker-compose up -d database cms`) and `npm run dev:web` running, open an existing article that has neither `pageCover` set nor `showCoverOnPage` enabled (all current articles, since these are new fields defaulting empty/false).

Expected: article detail page renders with **no** hero image block (same as before this change) — confirms the default-off behavior from the spec.

- [ ] **Step 4: Manual check — `showCoverOnPage = true`, no `pageCover`**

In Strapi admin (`http://localhost:1337/admin`), open that article, enable `showCoverOnPage`, save/publish. Reload the article page.

Expected: hero image block now renders, showing the shared `cover` image.

- [ ] **Step 5: Manual check — `pageCover` set**

In Strapi admin, upload a different image into `pageCover` on the same article, save/publish. Reload the article page.

Expected: hero image block shows the `pageCover` image, not the shared `cover`.

- [ ] **Step 6: Manual check — card/list view unaffected**

Open `/articles` (list view) and confirm the article's card still shows the shared `cover` image regardless of the `pageCover`/`showCoverOnPage` values set above.

- [ ] **Step 7: Repeat Steps 3-6 for a project on `/projects/[slug]`**

Same verification sequence using a project's `pageCover`/`showCoverOnPage` fields and the `/projects` list view.

- [ ] **Step 8: Revert test data**

In Strapi admin, clear the `pageCover` and `showCoverOnPage` test values set in Steps 4-5/7 on the article and project used for testing (unless the user wants to keep them) so no stray test content ships.

- [ ] **Step 9: Update feature docs**

Per `CLAUDE.md` working rules, document the new feature. Append to `ai/FEATURES.md` (or create it if absent) a short entry describing: separate `pageCover` + `showCoverOnPage` fields on article/project, resolution priority (`pageCover` → `cover` if flag on → none), and that list views/OG/JSON-LD are unaffected. Link to the spec at `docs/superpowers/specs/2026-07-12-separate-page-cover-design.md`.

- [ ] **Step 10: Commit docs**

```bash
git add ai/FEATURES.md
git commit -m "docs: document separate page cover feature"
```

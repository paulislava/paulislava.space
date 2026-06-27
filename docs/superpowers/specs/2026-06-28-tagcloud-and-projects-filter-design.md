# Tag Cloud + Projects Filter — Design Spec

**Date:** 2026-06-28  
**Project:** paulislava.space (Next.js frontend)

---

## Overview

Two connected features:
1. **Skills section** — replace the flat badge grid with an interactive 3D rotating tag sphere (technologies + project tags). Clicking any tag navigates to the Projects page pre-filtered by that item.
2. **Projects page** — add client-side filtering by tags and technologies as two separate filter rows. Filter state lives in URL search params.

---

## 1. 3D Tag Cloud (Skills section)

### Data

Currently `Skills` receives only `technologies: Technology[]`. We need to also load project tags (`Tag[]` where `category === 'project'`).

**New GraphQL query** in `packages/web/src/graphql/tags.graphql`:
```graphql
query GetAllProjectTags {
  tags(filters: { category: { eq: "project" } }, pagination: { limit: 100 }) {
    documentId
    name
    slug
    color
    category
  }
}
```

**New function** in `strapi.ts`:
```ts
export async function getProjectTags(): Promise<Tag[]>
```

**Main page** (`app/page.tsx`) fetches `getProjectTags()` in the `Promise.all` and passes `tags` to `<Skills>`.

### Component: `Skills.tsx`

Switches from the flat category-grouped layout to a 3D sphere.

**Package:** `TagCloud` (npm: `TagCloud`) — a CSS-based 3D rotating sphere, no canvas required.

**Props (updated):**
```ts
interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
}
```

**Sphere construction:**
- Each item is a `<span>` with `data-type="tech|tag"` and `data-slug="{slug}"`.
- Technologies styled `#6366f1`, tags styled with their CMS `color`.
- `TagCloud` initialised in `useEffect` with `radius: 260`, `maxSpeed: 'fast'`, `direction: 135`.
- Custom `onClick` listener on container — reads `data-type` and `data-slug` from the clicked span, calls `router.push('/projects?tech=slug')` or `router.push('/projects?tag=slug')`.
- On hover of any span: opacity decreases for all others (CSS class toggle), hovered item scales up.

**Removed:** category-grouped badge grid (`CATEGORY_ORDER`, `grouped`, stagger animation).

**Kept:** section header ("Навыки / Технологии"), scroll-trigger fade-in on the sphere container.

---

## 2. Projects Page Filtering

### Architecture

`app/projects/page.tsx` stays a **server component**: fetches all projects, derives unique tags and technologies from the project list, passes everything to `<ProjectsClient>`.

No new API calls are needed — tags and technologies are already present on each project object.

```ts
// Derived server-side:
const allTags = uniqueBy(projects.flatMap(p => p.tags), 'documentId');
const allTechs = uniqueBy(projects.flatMap(p => p.technologies), 'documentId');
```

### New component: `ProjectsClient.tsx` (client)

**Props:**
```ts
interface Props {
  projects: Project[];
  allTags: Tag[];
  allTechs: Technology[];
}
```

**URL params:** `?tag={slug}&tech={slug}`. Single-select per dimension. Clicking the active filter deselects it (removes the param).

**Filter logic:**
- If `tag` param is set: keep only projects whose `tags` array contains a tag with that slug.
- If `tech` param is set: keep only projects whose `technologies` array contains a tech with that slug.
- Both params can be active simultaneously (AND logic).

**Filter UI (above the grid):**
```
Теги:         [Все] [Open Source] [Telegram] [Pet project] ...
Технологии:   [Все] [React] [NestJS] [Docker] ...
```

- "Все" chip is always first; selecting it clears that filter dimension.
- Tag chips use their CMS color (same style as `Tag` component).
- Technology chips use glass style (same as existing `skill-badge`).
- Active chip has a solid background / border highlight.

**Grid:** same `sm:grid-cols-2 lg:grid-cols-3` layout as current. Shows filtered projects. If no projects match, shows "Нет проектов с таким фильтром".

### URL-based navigation from TagCloud

When the user arrives at `/projects?tech=react`, `useSearchParams` reads the value on mount, and the matching chip auto-activates. No extra logic needed.

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/graphql/tags.graphql` | **New** — `GetAllProjectTags` query |
| `src/gql/graphql.ts` | Re-run codegen to add new query types |
| `src/lib/strapi.ts` | Add `getProjectTags()` function |
| `src/app/page.tsx` | Fetch `getProjectTags()`, pass `tags` to `<Skills>` |
| `src/components/sections/Skills.tsx` | Replace badge grid with TagCloud 3D sphere |
| `src/app/projects/page.tsx` | Derive `allTags`/`allTechs`, render `<ProjectsClient>` |
| `src/app/projects/ProjectsClient.tsx` | **New** — client component with filter UI + grid |
| `package.json` (web) | Add `TagCloud` dependency |

---

## Constraints & Notes

- `TagCloud` requires a DOM element, so initialisation is in `useEffect`. SSR-safe.
- TagCloud renders its own `<span>` elements — we inject custom `data-*` attributes via the `texts` array format the library supports, or by post-processing the DOM spans in `useEffect`.
- `useRouter` and `useSearchParams` require the component to be a client component and be wrapped in `<Suspense>` boundary (Next.js requirement for `useSearchParams` in app router). `ProjectsClient` will be wrapped in `<Suspense>` in `page.tsx`.
- No new API calls on the Projects page — all filtering is client-side from the initial data load.

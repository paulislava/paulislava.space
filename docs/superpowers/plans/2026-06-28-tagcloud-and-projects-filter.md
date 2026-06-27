# Tag Cloud + Projects Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3D rotating TagCloud sphere to the Skills section and URL-based tag+technology filtering to the Projects page.

**Architecture:** New GraphQL query fetches all project tags; Skills section replaced with a `TagCloud` npm 3D sphere (both techs + tags); Projects page gains a client-side `ProjectsClient` component that reads `?tag=` and `?tech=` URL params and filters the pre-fetched project list.

**Tech Stack:** Next.js 15 App Router, TagCloud (npm), GSAP (existing), Tailwind CSS, GraphQL codegen.

## Global Constraints

- All components follow existing class/style patterns: `glass`, `#6366f1` indigo accent, `#0a0a0f` background, Tailwind utility classes only.
- `'use client'` for any component that uses hooks or browser APIs.
- Server components never import client-only APIs (`useRouter`, `useSearchParams`).
- `useSearchParams()` requires its component to be wrapped in `<Suspense>` in App Router.
- Working directory for all commands: `packages/web/`.

---

### Task 1: GraphQL query for project tags + codegen

**Files:**
- Create: `src/graphql/tags.graphql`
- Modify: `src/gql/graphql.ts` (codegen output — re-generated, not hand-edited)

**Interfaces:**
- Produces: `GetAllProjectTagsDocument`, `GetAllProjectTagsQuery` exported from `src/gql/graphql.ts`

- [ ] **Step 1: Create the GraphQL query file**

Create `src/graphql/tags.graphql`:
```graphql
query GetAllProjectTags {
  tags(
    filters: { category: { eq: "project" } }
    pagination: { limit: 100 }
    sort: "name:asc"
  ) {
    ...TagFields
  }
}
```

`TagFields` fragment is already defined in `src/graphql/fragments.graphql` — no changes needed there.

- [ ] **Step 2: Run codegen (requires Strapi running)**

```bash
npm run generate
```

Expected: `src/gql/graphql.ts` is updated, no errors. The file should now contain `GetAllProjectTagsDocument` and `GetAllProjectTagsQuery`.

Verify:
```bash
grep "GetAllProjectTags" src/gql/graphql.ts
```
Expected output includes `GetAllProjectTagsDocument` and `GetAllProjectTagsQuery`.

- [ ] **Step 3: Commit**

```bash
git add src/graphql/tags.graphql src/gql/graphql.ts
git commit -m "feat(web): add GetAllProjectTags GraphQL query + regenerate types"
```

---

### Task 2: Data layer — getProjectTags() + pass to Skills

**Files:**
- Modify: `src/lib/strapi.ts` — add `getProjectTags()`
- Modify: `src/app/page.tsx` — fetch tags, pass to `<Skills>`
- Modify: `src/components/sections/Skills.tsx` — update props interface only (implementation in Task 3)

**Interfaces:**
- Consumes: `GetAllProjectTagsDocument` from `src/gql/graphql.ts`
- Produces: `getProjectTags(): Promise<Tag[]>` (exported from `src/lib/strapi.ts`)

- [ ] **Step 1: Add getProjectTags() to strapi.ts**

In `src/lib/strapi.ts`, after the `getAllProjects` function, add:

```ts
export async function getProjectTags(): Promise<Tag[]> {
  const data = await gqlQuery(GetAllProjectTagsDocument);
  return (data.tags ?? []) as unknown as Tag[];
}
```

Also add `GetAllProjectTagsDocument` to the import at the top of the file:

```ts
import {
  GetTechnologiesDocument,
  GetWorkExperiencesDocument,
  GetFeaturedProjectsDocument,
  GetAllProjectsDocument,
  GetProjectBySlugDocument,
  GetArticlesDocument,
  GetArticleBySlugDocument,
  GetNewsItemsDocument,
  GetNewsBySlugDocument,
  GetAllProjectTagsDocument,        // ← add this
} from '@/gql/graphql';
```

- [ ] **Step 2: Update homepage to fetch tags**

In `src/app/page.tsx`, update the imports and `Promise.all`:

```tsx
import {
  getWorkExperiences,
  getTechnologies,
  getFeaturedProjects,
  getArticles,
  getNewsItems,
  getProjectTags,       // ← add
} from '@/lib/strapi';
```

Update `Promise.all`:
```tsx
const [workExperiences, technologies, featuredProjects, articles, news, projectTags] = await Promise.all([
  getWorkExperiences(),
  getTechnologies(),
  getFeaturedProjects(),
  getArticles(6),
  getNewsItems(6),
  getProjectTags(),     // ← add
]);
```

Update the `<Skills>` usage:
```tsx
<Skills technologies={technologies} tags={projectTags} />
```

- [ ] **Step 3: Update Skills props interface**

In `src/components/sections/Skills.tsx`, update the interface at the top:

```ts
import { Technology, Tag, mediaUrl } from '@/lib/strapi-types';

interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
}
```

The rest of the implementation stays as-is for now (this task just ensures the data flows without breaking the build). The component body still uses only `technologies` — that's fine for this step.

- [ ] **Step 4: Verify build doesn't break**

```bash
npm run build
```

Expected: build succeeds (TS errors would be caught here).

- [ ] **Step 5: Commit**

```bash
git add src/lib/strapi.ts src/app/page.tsx src/components/sections/Skills.tsx
git commit -m "feat(web): plumb projectTags through to Skills component"
```

---

### Task 3: Skills section — 3D TagCloud sphere

**Files:**
- Modify: `src/components/sections/Skills.tsx` — full replacement with TagCloud
- Modify: `packages/web/package.json` — add TagCloud dependency

**Interfaces:**
- Consumes: `technologies: Technology[]`, `tags: Tag[]` (from Task 2)
- No exports (leaf component)

- [ ] **Step 1: Install TagCloud**

```bash
npm install TagCloud
```

Check if types ship with the package:
```bash
ls node_modules/TagCloud/index.d.ts 2>/dev/null || echo "no types"
```

If "no types", create `src/types/TagCloud.d.ts`:
```ts
declare module 'TagCloud' {
  interface TagCloudOptions {
    radius?: number;
    maxSpeed?: 'slow' | 'normal' | 'fast';
    initSpeed?: 'slow' | 'normal' | 'fast';
    direction?: number;
    keep?: boolean;
  }
  interface TagCloudInstance {
    destroy(): void;
  }
  function TagCloud(
    container: HTMLElement | string,
    texts: string[],
    options?: TagCloudOptions
  ): TagCloudInstance;
  export default TagCloud;
}
```

- [ ] **Step 2: Replace Skills.tsx**

Replace the entire file with:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Technology, Tag } from '@/lib/strapi-types';

interface SkillsProps {
  technologies: Technology[];
  tags: Tag[];
}

export default function Skills({ technologies, tags }: SkillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const items = [
      ...technologies.map((t) => ({ type: 'tech', slug: t.slug, name: t.name, color: '#6366f1' })),
      ...tags.map((t) => ({ type: 'tag', slug: t.slug, name: t.name, color: t.color })),
    ];

    const texts = items.map((item) => item.name);
    let cloudInstance: { destroy(): void } | undefined;

    import('TagCloud').then(({ default: TagCloud }) => {
      if (!containerRef.current) return;

      cloudInstance = TagCloud(containerRef.current, texts, {
        radius: 260,
        maxSpeed: 'fast',
        initSpeed: 'fast',
        direction: 135,
        keep: true,
      });

      // Post-process: attach data attributes and colors to generated spans
      const spans = containerRef.current.querySelectorAll<HTMLElement>('.tagcloud--item');
      spans.forEach((span, i) => {
        const item = items[i];
        if (!item) return;
        span.dataset.itemType = item.type;
        span.dataset.itemSlug = item.slug;
        span.style.color = item.color;
        span.style.cursor = 'pointer';
        span.style.fontSize = '14px';
        span.style.fontFamily = 'var(--font-geist-sans), sans-serif';
      });
    });

    const handleClick = (e: MouseEvent) => {
      const span = (e.target as HTMLElement).closest<HTMLElement>('.tagcloud--item');
      if (!span) return;
      const type = span.dataset.itemType;
      const slug = span.dataset.itemSlug;
      if (type && slug) {
        router.push(`/projects?${type}=${slug}`);
      }
    };

    containerRef.current.addEventListener('click', handleClick as EventListener);

    return () => {
      containerRef.current?.removeEventListener('click', handleClick as EventListener);
      cloudInstance?.destroy();
    };
  }, [technologies, tags, router]);

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Навыки</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
        </div>

        <div
          ref={containerRef}
          className="tagcloud relative mx-auto"
          style={{ width: '100%', height: '560px' }}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify the sphere renders**

Start dev server and open the Skills section in the browser:
```bash
npm run dev
```

Navigate to `http://localhost:3000/#skills`. Expected:
- 3D sphere of tag names slowly rotating
- Technology names in indigo (`#6366f1`)
- Tag names in their CMS colors
- Clicking a tag navigates to `/projects?tech=slug` or `/projects?tag=slug`

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Skills.tsx src/types/TagCloud.d.ts package.json package-lock.json
git commit -m "feat(web): replace Skills badges with 3D TagCloud sphere"
```

---

### Task 4: ProjectsClient — filter UI + grid

**Files:**
- Create: `src/app/projects/ProjectsClient.tsx`

**Interfaces:**
- Consumes: `projects: Project[]`, `allTags: Tag[]`, `allTechs: Technology[]`
- Reads URL params: `?tag={slug}` and `?tech={slug}`
- Produces: filtered project grid with two filter rows

- [ ] **Step 1: Create ProjectsClient.tsx**

Create `src/app/projects/ProjectsClient.tsx`:

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Project, Tag, Technology, mediaUrl } from '@/lib/strapi-types';
import TagComponent from '@/components/ui/Tag';

interface Props {
  projects: Project[];
  allTags: Tag[];
  allTechs: Technology[];
}

export default function ProjectsClient({ projects, allTags, allTechs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTag = searchParams.get('tag');
  const activeTech = searchParams.get('tech');

  const setFilter = useCallback(
    (key: 'tag' | 'tech', slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set(key, slug);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `/projects?${qs}` : '/projects');
    },
    [router, searchParams],
  );

  const filtered = projects.filter((p) => {
    if (activeTag && !p.tags.some((t) => t.slug === activeTag)) return false;
    if (activeTech && !p.technologies.some((t) => t.slug === activeTech)) return false;
    return true;
  });

  return (
    <>
      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-2">Теги</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('tag', null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                !activeTag
                  ? 'bg-[#6366f1] text-white'
                  : 'glass text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              Все
            </button>
            {allTags.map((tag) => (
              <button
                key={tag.documentId}
                onClick={() => setFilter('tag', activeTag === tag.slug ? null : tag.slug)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  color: activeTag === tag.slug ? '#fff' : tag.color,
                  background: activeTag === tag.slug ? tag.color : `${tag.color}20`,
                  border: `1px solid ${tag.color}${activeTag === tag.slug ? '' : '40'}`,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Technology filters */}
      {allTechs.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest mb-2">
            Технологии
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('tech', null)}
              className={`px-3 py-1 text-xs rounded-lg transition-all border ${
                !activeTech
                  ? 'bg-[#6366f1] border-[#6366f1] text-white'
                  : 'glass border-white/10 text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              Все
            </button>
            {allTechs.map((tech) => (
              <button
                key={tech.documentId}
                onClick={() => setFilter('tech', activeTech === tech.slug ? null : tech.slug)}
                className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                  activeTech === tech.slug
                    ? 'bg-[#6366f1] border-[#6366f1] text-white'
                    : 'glass border-white/10 text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#6366f1]/40'
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[#94a3b8] text-center py-24">Нет проектов с таким фильтром</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
            return (
              <Link
                key={project.documentId}
                href={`/projects/${project.slug}`}
                className="glass rounded-2xl overflow-hidden group hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {cover && (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={cover}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-[#f1f5f9] text-lg mb-2 group-hover:text-[#6366f1] transition-colors">
                    {project.title}
                  </h2>
                  {project.shortDescription && (
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-4 flex-1">
                      {project.shortDescription}
                    </p>
                  )}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                      {project.tags.slice(0, 4).map((tag) => (
                        <TagComponent key={tag.documentId} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/projects/ProjectsClient.tsx
git commit -m "feat(web): add ProjectsClient with tag + tech filter UI"
```

---

### Task 5: Wire ProjectsClient into the projects page

**Files:**
- Modify: `src/app/projects/page.tsx` — derive filter data, render ProjectsClient in Suspense

**Interfaces:**
- Consumes: `getAllProjects()` from `src/lib/strapi.ts`
- Consumes: `ProjectsClient` from `./ProjectsClient`
- Produces: filtered projects page at `/projects`

- [ ] **Step 1: Replace projects/page.tsx**

Replace the entire file:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getAllProjects } from '@/lib/strapi';
import type { Tag, Technology } from '@/lib/strapi-types';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Проекты',
  description: 'Все проекты Павла Кондратова',
};

function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const allTags: Tag[] = uniqueBy(
    projects.flatMap((p) => p.tags),
    'documentId',
  );
  const allTechs: Technology[] = uniqueBy(
    projects.flatMap((p) => p.technologies),
    'documentId',
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <Link
            href="/#projects"
            className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2 hover:text-[#06b6d4] transition-colors flex items-center gap-2"
          >
            ← На главную
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mt-4">Все проекты</h1>
        </div>

        <Suspense fallback={<div className="text-[#94a3b8]">Загрузка...</div>}>
          <ProjectsClient projects={projects} allTags={allTags} allTechs={allTechs} />
        </Suspense>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify filter works end-to-end**

```bash
npm run dev
```

Check:
1. `/projects` — shows all projects, two filter rows visible
2. Click a tag chip — URL updates to `/projects?tag=slug`, grid filters
3. Click a tech chip — URL updates to `?tech=slug`, filters further
4. Click "Все" in either row — that dimension's param removed
5. Navigate to `/projects?tech=react` directly — React chip is pre-active
6. On main page, click a tech in the sphere — lands on `/projects?tech=slug` with correct filter active

- [ ] **Step 3: Final commit**

```bash
git add src/app/projects/page.tsx
git commit -m "feat(web): wire ProjectsClient into projects page with URL-based filtering"
```

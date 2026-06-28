# Plan B: Next.js Frontend Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full immersive portfolio website for paulislava.space — 7 homepage sections, individual content pages, ISR, contact form via SMTP, and full SEO.

**Architecture:** React Server Components fetch all data from Strapi v5 at build/revalidation time via a typed API client in `src/lib/strapi.ts`. Interactive UI (animations, sliders, forms) uses `"use client"` components. GSAP handles scroll animations, Framer Motion handles page transitions, Swiper.js handles carousels.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, GSAP 3 + @gsap/react, Framer Motion 12, Swiper 11, nodemailer, clsx + tailwind-merge

## Global Constraints
- ALL Strapi requests server-side only — no `NEXT_PUBLIC_STRAPI_*` env vars, no client-side Strapi fetch
- `STRAPI_URL` env var (e.g. `http://localhost:1337`) + `STRAPI_API_TOKEN` bearer on every request
- Colors: bg `#0a0a0f`, primary `#6366f1`, secondary `#06b6d4`, text `#f1f5f9`
- Glassmorphism cards: `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.1)`
- CDN images from `cdn.beznomera.net` (NOT .space)
- news API endpoint: `/api/news-items` (pluralName is "news-items")
- No TypeScript `any` — typed throughout
- All commands run from `packages/web/` unless stated otherwise
- Strapi v5 API response: `{ data: T | T[], meta: {...} }` — no `attributes` wrapper, fields directly on object

---

## File Structure

```
packages/web/src/
├── lib/
│   ├── strapi.ts          # typed API client + all TypeScript interfaces
│   └── utils.ts           # cn(), formatDate(), formatDateRange()
├── app/
│   ├── layout.tsx          # root layout: fonts, AnimatePresence wrapper, NavBar
│   ├── globals.css         # CSS variables, Tailwind v4 theme, base styles
│   ├── page.tsx            # home: imports all section server components
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── projects/[slug]/page.tsx
│   ├── articles/[slug]/page.tsx
│   ├── news/[slug]/page.tsx
│   └── api/
│       ├── health/route.ts   (exists)
│       ├── revalidate/route.ts
│       └── contact/route.ts
├── components/
│   ├── ui/
│   │   ├── NavBar.tsx        # sticky nav with smooth-scroll links
│   │   ├── GlassCard.tsx     # reusable glassmorphism card wrapper
│   │   ├── Tag.tsx           # colored pill tag
│   │   ├── TechBadge.tsx     # tech icon + name badge
│   │   ├── RichText.tsx      # renders Strapi blocks richtext
│   │   ├── ProjectCard.tsx   # card used in Projects section + listing
│   │   └── ArticleCard.tsx   # card used in Articles/News section
│   └── sections/
│       ├── Hero.tsx          # fullscreen, typewriter, particle canvas
│       ├── About.tsx         # bio + animated counters
│       ├── Experience.tsx    # vertical timeline
│       ├── Skills.tsx        # tech grid by category
│       ├── Projects.tsx      # Swiper carousel of featured projects
│       ├── ArticlesNews.tsx  # tabbed articles + news cards
│       └── Contact.tsx       # contact form → /api/contact
```

---

### Task 1: Dependencies, globals.css, layout.tsx

**Files:**
- Modify: `packages/web/package.json`
- Modify: `packages/web/src/app/globals.css`
- Modify: `packages/web/src/app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties `--color-primary`, `--color-secondary`, `--color-bg`, `--color-text`, `--glass-bg`, `--glass-border`; `cn()` available via `clsx`+`tailwind-merge`

- [ ] **Step 1: Install dependencies**

```bash
cd packages/web
npm install gsap @gsap/react framer-motion swiper nodemailer clsx tailwind-merge
npm install --save-dev @types/nodemailer
```

Expected: packages installed, no peer dep errors.

- [ ] **Step 2: Update globals.css**

Replace `packages/web/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-primary: #6366f1;
  --color-secondary: #06b6d4;
  --color-text: #f1f5f9;
  --color-muted: #94a3b8;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0f;
  color: #f1f5f9;
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  overflow-x: hidden;
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Section base */
section {
  position: relative;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }
```

- [ ] **Step 3: Update layout.tsx**

Replace `packages/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Павел Кондратов — Software Engineer', template: '%s | Павел Кондратов' },
  description: 'Software Engineer — React, Next.js, NestJS, DevOps. Портфолио проектов и статьи.',
  metadataBase: new URL('https://paulislava.space'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://paulislava.space',
    siteName: 'paulislava.space',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/NavBar.tsx`** (needed by layout, must exist before build)

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  { href: '#about', label: 'Обо мне' },
  { href: '#experience', label: 'Опыт' },
  { href: '#skills', label: 'Навыки' },
  { href: '#projects', label: 'Проекты' },
  { href: '#articles', label: 'Статьи' },
  { href: '#contact', label: 'Контакт' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm font-bold gradient-text">
          paulislava
        </Link>
        <ul className="hidden md:flex gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create placeholder `src/components/ui/GlassCard.tsx`**

```tsx
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn('glass rounded-2xl p-6', className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Create `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'н.в.';
  return new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

export function formatDateRange(start: string, end: string | null): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export function getYearsOfExperience(startYear = 2018): number {
  return new Date().getFullYear() - startYear;
}
```

- [ ] **Step 7: Verify build passes**

```bash
cd packages/web
npm run build 2>&1 | tail -20
```

Expected: BUILD SUCCESSFUL (or errors only about missing sections which haven't been created yet — that's OK as long as layout.tsx compiles).

- [ ] **Step 8: Commit**

```bash
git add packages/web/
git commit -m "feat(web): install deps, update globals, layout, NavBar, utils"
```

---

### Task 2: Strapi API Client

**Files:**
- Create: `packages/web/src/lib/strapi.ts`

**Interfaces:**
- Produces: `Technology`, `Tag`, `WorkExperience`, `Project`, `Article`, `NewsItem`, `StrapiMedia` types; fetch functions `getTechnologies()`, `getWorkExperiences()`, `getFeaturedProjects()`, `getAllProjects()`, `getProjectBySlug()`, `getArticles()`, `getNewsItems()`, `getArticleBySlug()`, `getNewsBySlug()`

- [ ] **Step 1: Create `packages/web/src/lib/strapi.ts`**

```ts
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const authHeaders = {
  Authorization: `Bearer ${STRAPI_TOKEN}`,
  'Content-Type': 'application/json',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface Technology {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Database' | 'Other';
  websiteUrl: string | null;
  icon: StrapiMedia | null;
}

export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  color: string;
  category: 'project' | 'news' | 'article';
}

export interface RichTextBlock {
  type: string;
  level?: number;
  children: Array<{ type: string; text?: string; bold?: boolean; italic?: boolean; url?: string; children?: RichTextBlock['children'] }>;
}

export interface WorkExperience {
  id: number;
  documentId: string;
  title: string;
  company: string;
  companyUrl: string | null;
  startDate: string;
  endDate: string | null;
  description: RichTextBlock[];
  isRemote: boolean;
  location: string | null;
  logo: StrapiMedia | null;
  technologies: Technology[];
}

export interface Project {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: RichTextBlock[];
  url: string | null;
  githubUrl: string | null;
  featured: boolean;
  cover: StrapiMedia | null;
  screenshots: StrapiMedia[];
  technologies: Technology[];
  tags: Tag[];
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  publishedAt: string;
  createdAt: string;
}

export interface NewsItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextBlock[];
  cover: StrapiMedia | null;
  tags: Tag[];
  technologies: Technology[];
  projects: Pick<Project, 'id' | 'documentId' | 'title' | 'slug'>[];
  publishedAt: string;
  createdAt: string;
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

async function strapiGet<T>(path: string, tag?: string): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`;
  const res = await fetch(url, {
    headers: authHeaders,
    next: tag ? { tags: [tag] } : { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Strapi GET ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getTechnologies(): Promise<Technology[]> {
  const res = await strapiGet<{ data: Technology[] }>(
    '/technologies?populate=icon&pagination[limit]=100&sort=category:asc,name:asc',
    'technologies',
  );
  return res.data;
}

export async function getWorkExperiences(): Promise<WorkExperience[]> {
  const res = await strapiGet<{ data: WorkExperience[] }>(
    '/work-experiences?populate=technologies,logo&pagination[limit]=100&sort=startDate:desc',
    'work-experiences',
  );
  return res.data;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const res = await strapiGet<{ data: Project[] }>(
    '/projects?populate=technologies,tags,cover,screenshots&filters[featured][$eq]=true&pagination[limit]=20&sort=createdAt:desc',
    'projects',
  );
  return res.data;
}

export async function getAllProjects(): Promise<Project[]> {
  const res = await strapiGet<{ data: Project[] }>(
    '/projects?populate=technologies,tags,cover&pagination[limit]=100&sort=createdAt:desc&status=published',
    'projects',
  );
  return res.data;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const res = await strapiGet<{ data: Project[] }>(
    `/projects?populate=technologies,tags,cover,screenshots,news&filters[slug][$eq]=${slug}&pagination[limit]=1`,
    'projects',
  );
  return res.data[0] ?? null;
}

export async function getArticles(limit = 10): Promise<Article[]> {
  const res = await strapiGet<{ data: Article[] }>(
    `/articles?populate=cover,tags,technologies&pagination[limit]=${limit}&sort=createdAt:desc&status=published`,
    'articles',
  );
  return res.data;
}

export async function getNewsItems(limit = 10): Promise<NewsItem[]> {
  const res = await strapiGet<{ data: NewsItem[] }>(
    `/news-items?populate=cover,tags,technologies,projects&pagination[limit]=${limit}&sort=createdAt:desc&status=published`,
    'news',
  );
  return res.data;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await strapiGet<{ data: Article[] }>(
    `/articles?populate=cover,tags,technologies&filters[slug][$eq]=${slug}&pagination[limit]=1&status=published`,
    'articles',
  );
  return res.data[0] ?? null;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const res = await strapiGet<{ data: NewsItem[] }>(
    `/news-items?populate=cover,tags,technologies,projects&filters[slug][$eq]=${slug}&pagination[limit]=1&status=published`,
    'news',
  );
  return res.data[0] ?? null;
}

export function mediaUrl(media: StrapiMedia | null | undefined, size?: 'thumbnail' | 'small' | 'medium' | 'large'): string | null {
  if (!media) return null;
  if (size && media.formats?.[size]) return media.formats[size]!.url;
  return media.url;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/web
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors in `src/lib/strapi.ts`.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/lib/
git commit -m "feat(web): add typed Strapi API client"
```

---

### Task 3: API Routes (revalidate + contact)

**Files:**
- Create: `packages/web/src/app/api/revalidate/route.ts`
- Create: `packages/web/src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: env `REVALIDATE_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`
- Produces: `POST /api/revalidate?secret=X&tag=Y` → calls `revalidateTag(Y)`; `POST /api/contact { name, email, message }` → sends email

- [ ] **Step 1: Create `src/app/api/revalidate/route.ts`**

```ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const tag = req.nextUrl.searchParams.get('tag');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  if (!tag) {
    return NextResponse.json({ error: 'Missing tag' }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
```

- [ ] **Step 2: Create `src/app/api/contact/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactBody {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"paulislava.space" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? process.env.SMTP_USER,
      replyTo: email,
      subject: `[paulislava.space] Сообщение от ${name}`,
      text: `От: ${name} <${email}>\n\n${message}`,
      html: `<p><b>От:</b> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`,
    });
  } catch (err) {
    console.error('SMTP error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/app/api/
git commit -m "feat(web): add revalidate and contact API routes"
```

---

### Task 4: UI Components (Tag, TechBadge, RichText, ProjectCard, ArticleCard)

**Files:**
- Create: `packages/web/src/components/ui/Tag.tsx`
- Create: `packages/web/src/components/ui/TechBadge.tsx`
- Create: `packages/web/src/components/ui/RichText.tsx`
- Create: `packages/web/src/components/ui/ProjectCard.tsx`
- Create: `packages/web/src/components/ui/ArticleCard.tsx`

**Interfaces:**
- Consumes: `Tag`, `Technology`, `Project`, `Article`, `NewsItem` from `@/lib/strapi`
- Produces: reusable display components used in sections and detail pages

- [ ] **Step 1: Create `src/components/ui/Tag.tsx`**

```tsx
import { Tag as TagType } from '@/lib/strapi';

interface TagProps {
  tag: Pick<TagType, 'name' | 'color'>;
  size?: 'sm' | 'md';
}

export default function Tag({ tag, size = 'sm' }: TagProps) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-block rounded-full font-medium ${padding}`}
      style={{
        color: tag.color,
        background: `${tag.color}20`,
        border: `1px solid ${tag.color}40`,
      }}
    >
      {tag.name}
    </span>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/TechBadge.tsx`**

```tsx
import Image from 'next/image';
import { Technology, mediaUrl } from '@/lib/strapi';

interface TechBadgeProps {
  tech: Technology;
  showName?: boolean;
}

export default function TechBadge({ tech, showName = true }: TechBadgeProps) {
  const icon = mediaUrl(tech.icon);
  return (
    <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-sm text-[#f1f5f9] hover:border-[#6366f1]/40 transition-colors">
      {icon && (
        <Image src={icon} alt={tech.name} width={16} height={16} className="w-4 h-4 object-contain" />
      )}
      {showName && <span>{tech.name}</span>}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/ui/RichText.tsx`**

```tsx
import { RichTextBlock } from '@/lib/strapi';

interface RichTextProps {
  blocks: RichTextBlock[];
  className?: string;
}

function renderChildren(children: RichTextBlock['children']): React.ReactNode {
  return children.map((child, i) => {
    if (child.type === 'text') {
      let node: React.ReactNode = child.text ?? '';
      if (child.bold) node = <strong key={i}>{node}</strong>;
      if (child.italic) node = <em key={i}>{node}</em>;
      return node;
    }
    if (child.type === 'link') {
      return (
        <a key={i} href={child.url} target="_blank" rel="noopener noreferrer"
          className="text-[#6366f1] hover:text-[#06b6d4] underline transition-colors">
          {renderChildren(child.children ?? [])}
        </a>
      );
    }
    return null;
  });
}

export default function RichText({ blocks, className = '' }: RichTextProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i} className="text-[#94a3b8] leading-relaxed mb-4">{renderChildren(block.children)}</p>;
          case 'heading': {
            const level = block.level ?? 2;
            const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            const sizes: Record<number, string> = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg', 5: 'text-base', 6: 'text-sm' };
            return <Tag key={i} className={`${sizes[level] ?? 'text-xl'} font-bold text-[#f1f5f9] mb-3 mt-6`}>{renderChildren(block.children)}</Tag>;
          }
          case 'list':
            return (
              <ul key={i} className="list-disc list-inside text-[#94a3b8] mb-4 space-y-1">
                {block.children.map((item, j) => (
                  <li key={j}>{renderChildren(item.children ?? [])}</li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={i} className="glass rounded-lg p-4 font-mono text-sm text-[#06b6d4] overflow-x-auto mb-4">
                {renderChildren(block.children)}
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/ProjectCard.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Project, mediaUrl } from '@/lib/strapi';
import Tag from './Tag';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="glass rounded-2xl overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 bg-[#12121a]">
          {cover ? (
            <Image src={cover} alt={project.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20 flex items-center justify-center">
              <span className="text-4xl font-bold gradient-text opacity-30">{project.title[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-[#f1f5f9] text-lg mb-1 group-hover:text-[#6366f1] transition-colors">{project.title}</h3>
          {project.shortDescription && (
            <p className="text-[#94a3b8] text-sm mb-3 line-clamp-2">{project.shortDescription}</p>
          )}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.tags.slice(0, 3).map((tag) => <Tag key={tag.id} tag={tag} />)}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span key={tech.id} className="text-xs text-[#6366f1] bg-[#6366f1]/10 rounded px-1.5 py-0.5">{tech.name}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Create `src/components/ui/ArticleCard.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Article, NewsItem, mediaUrl } from '@/lib/strapi';
import Tag from './Tag';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  item: Article | NewsItem;
  type: 'article' | 'news';
}

export default function ArticleCard({ item, type }: ArticleCardProps) {
  const href = type === 'article' ? `/articles/${item.slug}` : `/news/${item.slug}`;
  const cover = mediaUrl(item.cover, 'medium') ?? mediaUrl(item.cover);
  return (
    <Link href={href} className="group block">
      <div className="glass rounded-2xl overflow-hidden hover:border-[#06b6d4]/40 transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-36 bg-[#12121a]">
          {cover ? (
            <Image src={cover} alt={item.title} fill className="object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/20 to-[#6366f1]/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent" />
        </div>
        <div className="p-4">
          <p className="text-xs text-[#94a3b8] mb-1">{formatDate(item.createdAt)}</p>
          <h3 className="font-semibold text-[#f1f5f9] text-sm mb-2 line-clamp-2 group-hover:text-[#06b6d4] transition-colors">{item.title}</h3>
          {item.excerpt && <p className="text-[#94a3b8] text-xs line-clamp-2 mb-2">{item.excerpt}</p>}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => <Tag key={tag.id} tag={tag} />)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/web/src/components/ui/
git commit -m "feat(web): add UI components Tag, TechBadge, RichText, ProjectCard, ArticleCard"
```

---

### Task 5: Hero Section

**Files:**
- Create: `packages/web/src/components/sections/Hero.tsx`

**Interfaces:**
- Produces: `<Hero />` — server component wrapper, client canvas particle animation inside

- [ ] **Step 1: Create `src/components/sections/Hero.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const ROLES = ['Software Engineer', 'Tech Lead', 'Full-Stack Developer', 'DevOps Engineer'];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      }
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Typewriter effect
  useEffect(() => {
    const role = ROLES[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < role.length) {
      timeout = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === role.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, roleIndex]);

  // GSAP entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    if (headingRef.current) tl.from(headingRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
    if (subtitleRef.current) tl.from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    if (ctaRef.current) tl.from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-[120px]" />
      </div>

      <ParticleCanvas />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[#6366f1] font-mono text-sm mb-4 tracking-widest uppercase">Привет, я</p>

        <h1 ref={headingRef} className="text-5xl md:text-7xl font-bold text-[#f1f5f9] mb-4 leading-tight">
          Paul{' '}
          <span className="gradient-text">Kondratov</span>
        </h1>

        <p ref={subtitleRef} className="text-xl md:text-2xl text-[#94a3b8] mb-8 h-8">
          <span className="text-[#06b6d4]">{displayed}</span>
          <span className="animate-pulse">|</span>
        </p>

        <p className="text-[#94a3b8] text-base max-w-xl mx-auto mb-10">
          15 лет в разработке — от стартапов до продуктов SberDevices.
          Строю масштабируемые веб-приложения и DevOps-пайплайны.
        </p>

        <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap">
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors duration-200"
          >
            Проекты
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-xl font-semibold text-sm glass text-[#f1f5f9] hover:border-[#6366f1]/50 transition-colors duration-200"
          >
            Связаться
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs text-[#94a3b8] font-mono">scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#6366f1] to-transparent" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/components/sections/Hero.tsx
git commit -m "feat(web): Hero section with particle canvas and typewriter"
```

---

### Task 6: About + Experience Sections

**Files:**
- Create: `packages/web/src/components/sections/About.tsx`
- Create: `packages/web/src/components/sections/Experience.tsx`

**Interfaces:**
- Consumes: `WorkExperience[]` from `getWorkExperiences()`
- Produces: `<About />`, `<Experience workExperiences={WorkExperience[]} />`

- [ ] **Step 1: Create `src/components/sections/About.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getYearsOfExperience } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: getYearsOfExperience(2018), label: 'лет опыта', suffix: '+' },
  { value: 9, label: 'проектов', suffix: '' },
  { value: 4, label: 'хакатона', suffix: '' },
  { value: 3, label: 'города', suffix: '' },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll('.fade-in'), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
    });
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="fade-in mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Обо мне</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Кто я такой</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in space-y-4 text-[#94a3b8] leading-relaxed">
            <p>
              Software Engineer с 6+ годами опыта. Строю fullstack-продукты — от Telegram Mini App до внутренних корпоративных сервисов.
            </p>
            <p>
              Умею проектировать архитектуру, настраивать CI/CD, писать код и объяснять технические решения команде. Работал в SberDevices, стартапах и университете.
            </p>
            <p>
              Живу в Екатеринбурге, работаю удалённо. Люблю чистый код, автоматизацию и инструменты, которые экономят время.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://github.com/paulislava" target="_blank" rel="noopener noreferrer"
                className="text-[#6366f1] hover:text-[#06b6d4] transition-colors text-sm font-mono">
                GitHub →
              </a>
              <a href="mailto:i@paulislava.space"
                className="text-[#6366f1] hover:text-[#06b6d4] transition-colors text-sm font-mono">
                Email →
              </a>
            </div>
          </div>

          <div className="fade-in grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold gradient-text mb-1">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[#94a3b8] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/sections/Experience.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WorkExperience, mediaUrl } from '@/lib/strapi';
import { formatDateRange } from '@/lib/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface ExperienceProps {
  workExperiences: WorkExperience[];
}

export default function Experience({ workExperiences }: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const items = sectionRef.current.querySelectorAll('.exp-item');
    items.forEach((item, i) => {
      gsap.from(item, {
        x: i % 2 === 0 ? -30 : 30, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 80%', once: true },
      });
    });
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-24 px-6 bg-[#12121a]/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Опыт</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Где работал</h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#6366f1] via-[#06b6d4] to-transparent md:left-1/2" />

          <div className="space-y-8">
            {workExperiences.map((exp) => {
              const logo = mediaUrl(exp.logo, 'thumbnail') ?? mediaUrl(exp.logo);
              return (
                <div key={exp.id} className="exp-item relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8">
                  {/* Timeline dot */}
                  <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-[#6366f1] border-2 border-[#0a0a0f] md:left-1/2 md:-translate-x-1/2" />

                  <div className="glass rounded-2xl p-6 md:col-start-1 md:mr-8">
                    <div className="flex items-start gap-3 mb-3">
                      {logo && (
                        <Image src={logo} alt={exp.company} width={40} height={40} className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="font-bold text-[#f1f5f9] text-base">{exp.title}</h3>
                        <div className="flex items-center gap-2">
                          {exp.companyUrl ? (
                            <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[#6366f1] text-sm hover:text-[#06b6d4] transition-colors">
                              {exp.company}
                            </a>
                          ) : (
                            <span className="text-[#6366f1] text-sm">{exp.company}</span>
                          )}
                          {exp.isRemote && (
                            <span className="text-xs text-[#94a3b8] bg-white/5 rounded px-1.5 py-0.5">Remote</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] font-mono mb-3">
                      {formatDateRange(exp.startDate, exp.endDate)}
                      {exp.location && ` · ${exp.location}`}
                    </p>

                    {exp.description?.length > 0 && (
                      <p className="text-[#94a3b8] text-sm leading-relaxed">
                        {exp.description[0]?.children?.[0]?.text ?? ''}
                      </p>
                    )}

                    {exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {exp.technologies.slice(0, 6).map((tech) => (
                          <span key={tech.id} className="text-xs text-[#06b6d4] bg-[#06b6d4]/10 rounded px-1.5 py-0.5">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/components/sections/About.tsx packages/web/src/components/sections/Experience.tsx
git commit -m "feat(web): About and Experience sections with GSAP scroll animations"
```

---

### Task 7: Skills + Projects Sections

**Files:**
- Create: `packages/web/src/components/sections/Skills.tsx`
- Create: `packages/web/src/components/sections/Projects.tsx`

**Interfaces:**
- Consumes: `Technology[]` from `getTechnologies()`, `Project[]` from `getFeaturedProjects()`
- Produces: `<Skills technologies={Technology[]} />`, `<Projects projects={Project[]} />`

- [ ] **Step 1: Create `src/components/sections/Skills.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Technology, mediaUrl } from '@/lib/strapi';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface SkillsProps {
  technologies: Technology[];
}

const CATEGORY_ORDER: Technology['category'][] = ['Frontend', 'Backend', 'Database', 'DevOps', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#6366f1',
  Backend: '#10b981',
  Database: '#f59e0b',
  DevOps: '#06b6d4',
  Other: '#94a3b8',
};

export default function Skills({ technologies }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const grouped = CATEGORY_ORDER.reduce<Record<string, Technology[]>>((acc, cat) => {
    acc[cat] = technologies.filter((t) => t.category === cat);
    return acc;
  }, {});

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll('.skill-badge'), {
      scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
    });
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Навыки</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Технологии</h2>
        </div>

        <div className="space-y-8">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-mono uppercase tracking-widest mb-3" style={{ color: CATEGORY_COLORS[cat] }}>
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((tech) => {
                  const icon = mediaUrl(tech.icon);
                  return (
                    <div key={tech.id} className="skill-badge glass rounded-xl px-3 py-2 flex items-center gap-2 hover:border-[#6366f1]/40 transition-all duration-200 hover:-translate-y-0.5 cursor-default">
                      {icon && (
                        <Image src={icon} alt={tech.name} width={18} height={18} className="w-4.5 h-4.5 object-contain" />
                      )}
                      <span className="text-sm text-[#f1f5f9]">{tech.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Install Swiper CSS import approach**

Swiper in Next.js App Router needs a client-only wrapper. The CSS must be imported in a `"use client"` component.

- [ ] **Step 3: Create `src/components/sections/Projects.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import Image from 'next/image';
import { Project, mediaUrl } from '@/lib/strapi';
import Tag from '@/components/ui/Tag';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelector('.section-header'), {
      y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
    });
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="py-24 px-6 bg-[#12121a]/50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="section-header mb-10 flex items-end justify-between">
          <div>
            <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Проекты</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Что я строил</h2>
          </div>
          <Link href="/projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors hidden md:block">
            Все проекты →
          </Link>
        </div>

        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            1024: { slidesPerView: 2.5 },
          }}
          className="!overflow-visible"
          style={{
            '--swiper-theme-color': '#6366f1',
            '--swiper-navigation-size': '24px',
          } as React.CSSProperties}
        >
          {projects.map((project) => {
            const cover = mediaUrl(project.cover, 'medium') ?? mediaUrl(project.cover);
            return (
              <SwiperSlide key={project.id}>
                <Link href={`/projects/${project.slug}`} className="group block">
                  <div className="glass rounded-2xl overflow-hidden hover:border-[#6366f1]/40 transition-all duration-300 pb-2">
                    <div className="relative h-52 bg-[#12121a]">
                      {cover ? (
                        <Image src={cover} alt={project.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20 flex items-center justify-center">
                          <span className="text-5xl font-bold gradient-text opacity-30">{project.title[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#f1f5f9] mb-1 group-hover:text-[#6366f1] transition-colors">{project.title}</h3>
                      {project.shortDescription && (
                        <p className="text-[#94a3b8] text-sm mb-3 line-clamp-2">{project.shortDescription}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tags.slice(0, 3).map((tag) => <Tag key={tag.id} tag={tag} />)}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span key={tech.id} className="text-xs text-[#6366f1] bg-[#6366f1]/10 rounded px-1.5 py-0.5">{tech.name}</span>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-4">
                        {project.url && (
                          <span className="text-xs text-[#06b6d4] font-mono">Открыть →</span>
                        )}
                        {project.githubUrl && (
                          <span className="text-xs text-[#94a3b8] font-mono">GitHub →</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="mt-8 text-center md:hidden">
          <Link href="/projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors">
            Все проекты →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/sections/Skills.tsx packages/web/src/components/sections/Projects.tsx
git commit -m "feat(web): Skills grid and Projects Swiper carousel"
```

---

### Task 8: ArticlesNews + Contact + Home Page

**Files:**
- Create: `packages/web/src/components/sections/ArticlesNews.tsx`
- Create: `packages/web/src/components/sections/Contact.tsx`
- Modify: `packages/web/src/app/page.tsx`

**Interfaces:**
- Consumes: all fetch functions from strapi.ts
- Produces: complete home page at `/`

- [ ] **Step 1: Create `src/components/sections/ArticlesNews.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Article, NewsItem } from '@/lib/strapi';
import ArticleCard from '@/components/ui/ArticleCard';

interface ArticlesNewsProps {
  articles: Article[];
  news: NewsItem[];
}

export default function ArticlesNews({ articles, news }: ArticlesNewsProps) {
  const [tab, setTab] = useState<'articles' | 'news'>('articles');

  const hasContent = articles.length > 0 || news.length > 0;

  return (
    <section id="articles" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Контент</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9]">Статьи и новости</h2>
        </div>

        <div className="flex gap-4 mb-8">
          {(['articles', 'news'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === t
                  ? 'bg-[#6366f1] text-white'
                  : 'glass text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              {t === 'articles' ? `Статьи (${articles.length})` : `Новости (${news.length})`}
            </button>
          ))}
        </div>

        {!hasContent ? (
          <p className="text-[#94a3b8] text-center py-12">Скоро появится контент</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tab === 'articles'
              ? articles.map((a) => <ArticleCard key={a.id} item={a} type="article" />)
              : news.map((n) => <ArticleCard key={n.id} item={n} type="news" />)}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/sections/Contact.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-[#12121a]/50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[#6366f1] font-mono text-sm uppercase tracking-widest mb-2">Контакт</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">Напишите мне</h2>
          <p className="text-[#94a3b8]">Открыт к интересным проектам и предложениям о сотрудничестве</p>
        </div>

        {status === 'ok' ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-[#10b981] font-semibold mb-1">Сообщение отправлено!</p>
            <p className="text-[#94a3b8] text-sm">Я отвечу в ближайшее время.</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors">
              Отправить ещё
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Имя</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ваше имя"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#6366f1]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5 font-mono uppercase tracking-wide">Сообщение</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Расскажите о вашем проекте или задаче..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f1f5f9] text-sm placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#6366f1]/50 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">Не удалось отправить. Попробуйте позже.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Отправляем...' : 'Отправить сообщение'}
            </button>
          </form>
        )}

        <div className="mt-12 text-center space-y-2">
          <p className="text-[#94a3b8] text-sm">Или напрямую:</p>
          <a href="mailto:i@paulislava.space" className="text-[#6366f1] hover:text-[#06b6d4] transition-colors font-mono text-sm">
            i@paulislava.space
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx` with full home page**

```tsx
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import ArticlesNews from '@/components/sections/ArticlesNews';
import Contact from '@/components/sections/Contact';
import {
  getWorkExperiences,
  getTechnologies,
  getFeaturedProjects,
  getArticles,
  getNewsItems,
} from '@/lib/strapi';

export default async function HomePage() {
  const [workExperiences, technologies, featuredProjects, articles, news] = await Promise.all([
    getWorkExperiences(),
    getTechnologies(),
    getFeaturedProjects(),
    getArticles(6),
    getNewsItems(6),
  ]);

  return (
    <main>
      <Hero />
      <About />
      <Experience workExperiences={workExperiences} />
      <Skills technologies={technologies} />
      <Projects projects={featuredProjects} />
      <ArticlesNews articles={articles} news={news} />
      <Contact />
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
cd packages/web
npm run build 2>&1 | grep -E 'error|Error|✓|✗' | head -30
```

Expected: BUILD SUCCESSFUL. If GSAP/Swiper SSR errors appear, they're in `"use client"` components — OK.

- [ ] **Step 5: Commit**

```bash
git add packages/web/src/
git commit -m "feat(web): ArticlesNews, Contact sections and full home page"
```

---

### Task 9: Project Detail Page

**Files:**
- Create: `packages/web/src/app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProjectBySlug()`, `getAllProjects()` from strapi.ts
- Produces: `/projects/[slug]` with cover, screenshots Swiper, richtext, tech stack, news

- [ ] **Step 1: Create `src/app/projects/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProjects, getProjectBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import ProjectScreenshots from './ProjectScreenshots';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription ?? undefined,
    openGraph: {
      images: project.cover ? [{ url: project.cover.url }] : [],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = mediaUrl(project.cover, 'large') ?? mediaUrl(project.cover);

  return (
    <main className="min-h-screen pt-20">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[320px]">
        {cover ? (
          <Image src={cover} alt={project.title} fill className="object-cover opacity-50" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-[#06b6d4]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 px-6 max-w-4xl mx-auto">
          <Link href="/#projects" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-3 block font-mono">
            ← Назад к проектам
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-3">{project.title}</h1>
          {project.shortDescription && (
            <p className="text-[#94a3b8] text-lg">{project.shortDescription}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Links + Tags */}
        <div className="flex flex-wrap gap-4 items-center mb-10">
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors">
              Открыть сайт →
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl glass text-[#f1f5f9] text-sm font-semibold hover:border-[#6366f1]/40 transition-colors">
              GitHub →
            </a>
          )}
          {project.tags.map((tag) => <Tag key={tag.id} tag={tag} size="md" />)}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            {project.description?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">О проекте</h2>
                <RichText blocks={project.description} />
              </div>
            )}

            {/* Screenshots */}
            {project.screenshots?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">Скриншоты</h2>
                <ProjectScreenshots screenshots={project.screenshots} />
              </div>
            )}
          </div>

          {/* Sidebar: tech stack */}
          <div>
            <div className="glass rounded-2xl p-5 sticky top-24">
              <h3 className="text-sm font-mono uppercase tracking-widest text-[#6366f1] mb-4">Стек</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech.id} className="text-xs text-[#f1f5f9] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/app/projects/[slug]/ProjectScreenshots.tsx`** (client Swiper)

```tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { StrapiMedia, mediaUrl } from '@/lib/strapi';

export default function ProjectScreenshots({ screenshots }: { screenshots: StrapiMedia[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={16}
      className="rounded-2xl overflow-hidden"
      style={{ '--swiper-theme-color': '#6366f1' } as React.CSSProperties}
    >
      {screenshots.map((s) => {
        const url = mediaUrl(s, 'large') ?? mediaUrl(s) ?? '';
        return (
          <SwiperSlide key={s.id}>
            <div className="relative aspect-video bg-[#12121a]">
              <Image src={url} alt={s.alternativeText ?? ''} fill className="object-cover" />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/app/projects/
git commit -m "feat(web): project detail page with screenshots Swiper"
```

---

### Task 10: Article + News Detail Pages

**Files:**
- Create: `packages/web/src/app/articles/[slug]/page.tsx`
- Create: `packages/web/src/app/news/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getArticleBySlug()`, `getNewsBySlug()`, `getArticles()`, `getNewsItems()`
- Produces: `/articles/[slug]` and `/news/[slug]` pages

- [ ] **Step 1: Create `src/app/articles/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getArticles, getArticleBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const articles = await getArticles(100);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { images: article.cover ? [{ url: article.cover.url }] : [] },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const cover = mediaUrl(article.cover, 'large') ?? mediaUrl(article.cover);

  return (
    <main className="min-h-screen pt-20">
      {cover && (
        <div className="relative h-64">
          <Image src={cover} alt={article.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/#articles" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-6 block font-mono">
          ← Назад к статьям
        </Link>
        <p className="text-[#94a3b8] text-sm mb-2">{formatDate(article.createdAt)}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">{article.title}</h1>
        {article.excerpt && <p className="text-[#94a3b8] text-lg mb-6 leading-relaxed">{article.excerpt}</p>}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag) => <Tag key={tag.id} tag={tag} size="md" />)}
          {article.technologies.map((tech) => (
            <span key={tech.id} className="text-xs text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-2.5 py-1">
              {tech.name}
            </span>
          ))}
        </div>
        <div className="glass rounded-2xl p-8">
          <RichText blocks={article.content} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/app/news/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getNewsItems, getNewsBySlug, mediaUrl } from '@/lib/strapi';
import RichText from '@/components/ui/RichText';
import Tag from '@/components/ui/Tag';
import { formatDate } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const news = await getNewsItems(100);
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt ?? undefined,
    openGraph: { images: item.cover ? [{ url: item.cover.url }] : [] },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();
  const cover = mediaUrl(item.cover, 'large') ?? mediaUrl(item.cover);

  return (
    <main className="min-h-screen pt-20">
      {cover && (
        <div className="relative h-64">
          <Image src={cover} alt={item.title} fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/#articles" className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors mb-6 block font-mono">
          ← Назад к новостям
        </Link>
        <p className="text-[#94a3b8] text-sm mb-2">{formatDate(item.createdAt)}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#f1f5f9] mb-4">{item.title}</h1>
        {item.excerpt && <p className="text-[#94a3b8] text-lg mb-6 leading-relaxed">{item.excerpt}</p>}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => <Tag key={tag.id} tag={tag} size="md" />)}
        </div>
        {item.projects.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#94a3b8] font-mono uppercase tracking-wide mb-2">Проекты</p>
            <div className="flex flex-wrap gap-2">
              {item.projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`}
                  className="text-sm text-[#6366f1] hover:text-[#06b6d4] transition-colors underline">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="glass rounded-2xl p-8">
          <RichText blocks={item.content} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/app/articles/ packages/web/src/app/news/
git commit -m "feat(web): article and news detail pages"
```

---

### Task 11: SEO — Metadata, Sitemap, Robots

**Files:**
- Modify: `packages/web/src/app/layout.tsx` (JSON-LD script)
- Create: `packages/web/src/app/sitemap.ts`
- Create: `packages/web/src/app/robots.ts`

**Interfaces:**
- Produces: `GET /sitemap.xml`, `GET /robots.txt`, JSON-LD `Person` schema in `<head>`

- [ ] **Step 1: Add JSON-LD to layout.tsx**

Add to the `<head>` inside `RootLayout`, before the closing `</html>`:

```tsx
// Add to layout.tsx, inside <body> before NavBar OR as a <script> in <head>
// The layout already has the <html><body> structure — add this script tag:
```

Update `layout.tsx` to add JSON-LD in `<head>`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Павел Кондратов — Software Engineer', template: '%s | Павел Кондратов' },
  description: 'Software Engineer — React, Next.js, NestJS, DevOps. Портфолио проектов и статьи.',
  metadataBase: new URL('https://paulislava.space'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://paulislava.space',
    siteName: 'paulislava.space',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Павел Кондратов',
  url: 'https://paulislava.space',
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'SberDevices' },
  sameAs: ['https://github.com/paulislava'],
  email: 'i@paulislava.space',
  address: { '@type': 'PostalAddress', addressLocality: 'Екатеринбург', addressCountry: 'RU' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `src/app/sitemap.ts`**

```ts
import { MetadataRoute } from 'next';
import { getAllProjects, getArticles, getNewsItems } from '@/lib/strapi';

const BASE = 'https://paulislava.space';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, news] = await Promise.all([
    getAllProjects(),
    getArticles(100),
    getNewsItems(100),
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...projects.map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...news.map((n) => ({
      url: `${BASE}/news/${n.slug}`,
      lastModified: new Date(n.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
```

- [ ] **Step 3: Create `src/app/robots.ts`**

```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: 'https://paulislava.space/sitemap.xml',
  };
}
```

- [ ] **Step 4: Final build check**

```bash
cd packages/web
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` or `Route (app)` table listing all pages without errors.

- [ ] **Step 5: Commit and push**

```bash
git add packages/web/src/
git commit -m "feat(web): SEO — JSON-LD, sitemap, robots"
git push origin main
```

- [ ] **Step 6: Watch CI/CD pass**

```bash
gh run watch $(gh run list --repo paulislava/paulislava.space --limit 1 --json databaseId --jq '.[0].databaseId') --repo paulislava/paulislava.space
```

Expected: all jobs green, `paulislava.space` shows the new homepage.

---

## Self-Review

**Spec coverage check:**
- ✅ Hero (typewriter, particles, CTA)
- ✅ About (bio, counters with GSAP ScrollTrigger)
- ✅ Experience (timeline, glassmorphism cards, logos, tech stack)
- ✅ Skills (grid by category with hover)
- ✅ Projects (Swiper carousel, featured filter)
- ✅ Articles & News (tabs, cards)
- ✅ Contact (form → /api/contact → SMTP)
- ✅ /projects/[slug] (cover, screenshots Swiper, richtext, tags, stack, back-link)
- ✅ /articles/[slug] + /news/[slug]
- ✅ generateStaticParams on all slug pages
- ✅ ISR revalidate webhook (/api/revalidate)
- ✅ generateMetadata on all pages
- ✅ JSON-LD Person schema
- ✅ sitemap.ts
- ✅ robots.ts
- ✅ CDN images from cdn.beznomera.net
- ✅ No NEXT_PUBLIC_STRAPI_* env vars

**Placeholder scan:** No TBD/TODO found.

**Type consistency:** All types defined in `strapi.ts` Task 2 and used consistently in later tasks.

---
project: paulislava-space
date: 2026-06-29
tags: [features, rss, next.js]
---

# RSS-лента для paulislava.space

## Контекст

Сайт на Next.js 16 + Strapi CMS. Два типа контента: статьи (`/articles/[slug]`) и новости (`/news/[slug]`). Данные получаются через Apollo GraphQL. Уже есть `sitemap.ts` по аналогичному паттерну Next.js route handler.

## Требования

Три RSS-фида:
- `/rss.xml` — объединённый (статьи + новости, лимит 50, по 25 каждого типа, сортировка по дате убывания)
- `/rss/articles.xml` — только статьи (лимит 25)
- `/rss/news.xml` — только новости (лимит 25)

## Архитектура

### Новые файлы

```
packages/web/src/
├── lib/
│   └── rss.ts                     # хелпер buildRssFeed(items, meta) → string
└── app/
    ├── rss.xml/
    │   └── route.ts               # GET /rss.xml
    ├── rss/
    │   ├── articles.xml/
    │   │   └── route.ts           # GET /rss/articles.xml
    │   └── news.xml/
    │       └── route.ts           # GET /rss/news.xml
```

### Изменяемые файлы

- `packages/web/src/app/layout.tsx` — добавить `alternates` в `metadata`

### Тип RssItem

```ts
interface RssItem {
  title: string;
  link: string;        // полный URL https://paulislava.space/...
  description: string; // excerpt или пустая строка
  pubDate: string;     // RFC-822: toUTCString()
  guid: string;        // = link
  category?: string;   // 'article' | 'news'
}
```

### Интерфейс хелпера

```ts
interface RssFeedMeta {
  title: string;
  link: string;
  description: string;
}

function buildRssFeed(items: RssItem[], meta: RssFeedMeta): string
```

## Формат XML

RSS 2.0. Спецсимволы в `title` и `description` — через `<![CDATA[...]]>`. `Content-Type: application/xml; charset=utf-8`.

## Кеширование

`revalidate: 1800` (30 минут) — согласованно со статьями в `strapi.ts`.

## Интеграция в `<head>`

В `layout.tsx` добавить в объект `metadata`:

```ts
alternates: {
  types: {
    'application/rss+xml': [
      { url: '/rss.xml', title: 'Paulislava — Всё' },
      { url: '/rss/articles.xml', title: 'Paulislava — Статьи' },
      { url: '/rss/news.xml', title: 'Paulislava — Новости' },
    ],
  },
},
```

Next.js генерирует `<link rel="alternate" type="application/rss+xml">` автоматически.

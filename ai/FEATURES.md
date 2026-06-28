# Features

## RSS-лента (2026-06-29)

Три RSS 2.0 фида через Next.js Route Handlers:

- `/rss.xml` — объединённый (статьи + новости, лимит 50, сортировка по дате)
- `/rss/articles.xml` — только статьи (лимит 25)
- `/rss/news.xml` — только новости (лимит 25)

**Файлы:**
- `packages/web/src/lib/rss.ts` — хелпер `buildRssFeed(items, meta)`
- `packages/web/src/app/rss.xml/route.ts`
- `packages/web/src/app/rss/articles.xml/route.ts`
- `packages/web/src/app/rss/news.xml/route.ts`
- `packages/web/src/app/layout.tsx` — `metadata.alternates` для автодискавери

Кеш: `revalidate: 1800`. Спецсимволы через `<![CDATA[...]]>`.

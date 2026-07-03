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

## SEO, AI-видимость и Яндекс Метрика (2026-07-02)

Добавлены Метрика, цель формы, `llms.txt`, расширенный `robots.txt`, JSON-LD для ключевых страниц и файл подтверждения Яндекс Вебмастера.

Подробнее: [seo-ai-visibility-and-yandex-metrika.md](features/seo-ai-visibility-and-yandex-metrika.md)

## Похожие статьи, циклы и навигация (2026-07-03)

Структура для связанных статей и навигации по циклам.

**CMS:**
- Новый content type `article-series` (title, slug, description, articles oneToMany)
- В `article` schema: поля `relatedArticles` (manyToMany self), `series` (manyToOne → article-series), `orderInSeries` (integer)

**Web:**
- `packages/web/src/components/ui/RelatedArticles.tsx` — блок «Похожие статьи» (карточки)
- `packages/web/src/components/ui/SeriesNavigation.tsx` — блок цикла: список частей, prev/next кнопки
- `packages/web/src/app/series/page.tsx` — список всех циклов
- `packages/web/src/app/series/[slug]/page.tsx` — разводящая страница цикла
- `packages/web/src/lib/strapi.ts` — `getArticleExtras()`, `getAllArticleSeries()`, `getArticleSeriesBySlug()`
- `packages/web/src/graphql/articles.graphql` — обновлены запросы, добавлен `GetAllArticleSeries`

**Важно:** `gql/graphql.ts` нужно перегенерировать после деплоя CMS (`npm run generate` в `packages/web`). До этого момента `getArticleExtras` и `getAllArticleSeries` используют inline gql-запросы и возвращают пустые данные gracefully.

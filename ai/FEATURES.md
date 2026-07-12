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

## Главная под `case-study first` (2026-07-04)

Главная страница усилена так, чтобы первым смысловым блоком после hero были кейсы, а не биографические секции.

**Что изменено:**
- `packages/web/src/app/page.tsx` — проекты и статьи подняты выше About/Experience/Skills.
- `packages/web/src/components/sections/Hero.tsx` — copy hero смещён в сторону инженерных кейсов и результата.
- `packages/web/src/components/sections/Projects.tsx` — секция переоформлена как блок ключевых кейсов с контекстом и ограничениями.
- `packages/web/src/components/sections/ArticlesNews.tsx` — секция переоформлена как экспертные разборы архитектурных и инженерных решений.

**Нетривиальные детали:**
- Структура главной теперь читаетcя как case-study first: сначала hero, затем кейсы, затем экспертные материалы, и только потом биографические секции.
- CTA в hero и секции проектов синхронизированы с языком кейсов.

Подробнее: [case-study-first-expert-seo.md](features/case-study-first-expert-seo.md)

## Кейсы как основной SEO/AI-слой, статьи как экспертный слой (2026-07-12)

Сайт усилен под поисковые системы и нейросети вокруг стратегии `case-study first`: проекты стали основным слоем доверия, а статьи начали поддерживать их как экспертные разборы.

**Что изменено:**
- `packages/web/src/lib/llms.ts` — вынесена динамическая генерация `llms.txt` и `llms-full.txt` из данных Strapi.
- `packages/web/src/app/llms.txt/route.ts`, `packages/web/src/app/llms-full.txt/route.ts` — добавлены компактный и расширенный AI-манифесты.
- `packages/web/src/app/projects/[slug]/page.tsx`, `packages/web/src/components/projects/ProjectCaseStudy.tsx` — страницы проектов превращены в полноценные кейсы с FAQ, контекстом, решением и технологическим блоком.
- `packages/web/src/app/articles/[slug]/page.tsx`, `packages/web/src/components/articles/RelatedProjects.tsx` — статьи получили блоки позиционирования и связанные проекты.
- `packages/web/src/lib/seo.ts`, `packages/web/src/app/layout.tsx` — усилены metadata и JSON-LD под инженерные кейсы и экспертные разборы.

**Нетривиальные детали:**
- `llms.txt` и `llms-full.txt` больше не статические: они собираются на базе актуальных проектов и статей.
- Пустые и пробельные `shortDescription` из CMS нормализуются, чтобы не ломать metadata, OG и кейсовые блоки.
- В статьях связанные проекты подбираются автоматически по пересечению тегов и технологий, чтобы поисковый и AI-контекст связывал материалы между собой.

Подробнее: [case-study-first-expert-seo.md](features/case-study-first-expert-seo.md)


## Masonry-раскладка сеток проектов и статей (2026-07-12)

Сетки карточек проектов и статей переведены с CSS Grid на CSS multi-column masonry (`columns-*` + `break-inside-avoid`), чтобы каждая карточка сохраняла собственную высоту вместо растягивания под самую высокую в строке.

**Файлы:**
- `packages/web/src/app/projects/ProjectsClient.tsx`, `packages/web/src/app/articles/ArticlesClient.tsx` — сетки страниц `/projects` и `/articles`
- `packages/web/src/components/sections/ArticlesNews.tsx` + `packages/web/src/components/ui/ArticleCard.tsx` — блок статей/новостей на главной
- `packages/web/src/components/articles/RelatedProjects.tsx` + `packages/web/src/components/ui/ProjectCard.tsx` — похожие проекты в статье
- `packages/web/src/components/ui/RelatedArticles.tsx` — похожие статьи

**Нетривиальные детали:**
- Решение без JS-зависимостей: чистый CSS `columns-*`, не вызывает layout shift/CLS при гидратации.
- В column-layout `gap` задаёт только зазор между колонками — вертикальный отступ между карточками одной колонки задан через `mb-*` на каждой карточке.
- `break-inside-avoid` на карточках не даёт им разрываться между колонками.
- Компромисс: карточки заполняют колонки сверху вниз по одной, а не построчно слева направо (особенность CSS multi-column masonry).

Подробнее: [дизайн](../docs/superpowers/specs/2026-07-12-masonry-grids-design.md), [план](../docs/superpowers/plans/2026-07-12-masonry-grids.md)

## SEO-исправления: canonical + og-default.png (2026-07-04)

**Проблемы:**
- `og-default.png` отсутствовал в `/public`, хотя был прописан в `layout.tsx` — OG image не отображался.
- Canonical URL не был задан в metadata.

**Что сделано:**
- `packages/web/src/app/layout.tsx` — добавлен `alternates.canonical: 'https://paulislava.space'`
- `packages/web/public/og-default.png` — сгенерирован (1200×630, тёмный фон, текст: имя + роли + URL)

## Skill добавления проектов в Strapi (2026-07-12)

Добавлен проектный skill `.claude/skills/add-strapi-project`, который фиксирует полный процесс добавления портфолио-проекта: исследование сайта, подготовку контента, выбор технологий и тегов, подбор или генерацию обложки, публикацию в Strapi, revalidate и финальную красивую ссылку на созданную сущность.

## Слайдер статей на главной (2026-07-12)

Блок статей/новостей на главной странице переведён с masonry-раскладки на слайдер по тому же паттерну, что и секция проектов.

**Файлы:**
- `packages/web/src/components/sections/ArticlesNews.tsx`

**Нетривиальные детали:**
- Используется уже подключённый `swiper` с модулем `A11y`, без новой зависимости.
- Сохранены табы `Статьи / Новости`, ссылка `Все статьи` и существующие `ArticleCard`.
- Слайдер повторяет UX проектов: full-width carousel strip, видимые соседние карточки, edge-gradient и стрелки назад/вперёд.
- При переключении таба Swiper сбрасывается к началу и обновляет состояние стрелок.

## CDN-обложки по умолчанию (2026-07-12)

Сгенерированы и загружены в Strapi/S3 CDN разные fallback-обложки для проектов, статей и новостей. Код использует CDN URL, а не локальные файлы.

**Файлы:**
- `packages/web/src/lib/default-covers.ts`
- `packages/web/src/components/ui/ArticleCard.tsx`
- `packages/web/src/components/ui/ProjectCard.tsx`
- `packages/web/src/components/ui/RelatedArticles.tsx`
- `packages/web/src/components/sections/Projects.tsx`
- `packages/web/src/app/articles/ArticlesClient.tsx`
- `packages/web/src/app/articles/[slug]/page.tsx`
- `packages/web/src/app/projects/ProjectsClient.tsx`
- `packages/web/src/app/projects/[slug]/page.tsx`
- `packages/web/src/app/news/[slug]/page.tsx`
- `packages/web/src/app/series/page.tsx`
- `packages/web/src/app/series/[slug]/page.tsx`
- `packages/web/src/lib/seo.ts`

**CDN:**
- Проекты: `https://cdn.paulislava.space/project_default_cover_f2a092e620.png`
- Статьи: `https://cdn.paulislava.space/article_default_cover_6b88526408.png`
- Новости: `https://cdn.paulislava.space/news_default_cover_e9289eb87f.png`

**Нетривиальные детали:**
- Fallback применяется в карточках, списках, сериях, detail hero, Open Graph metadata и JSON-LD.
- Для сущностей с реальной `cover` из CMS поведение не меняется: используется загруженная обложка.
- Для записей без `cover` больше нет пустых hero/градиентных заглушек.

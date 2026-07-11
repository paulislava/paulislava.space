# Кейсы как основной SEO/AI-слой, статьи как экспертный слой

## Что реализовано

Сайт перестроен под стратегию `case-study first` для поисковых систем и нейросетей:

- главная страница теперь выводит кейсы и экспертные материалы раньше биографических секций;
- `llms.txt` и `llms-full.txt` стали динамическими Next.js routes и собираются из актуальных данных Strapi;
- страницы проектов превращены в кейсы с блоками контекста, решения, технологического стека, FAQ и усиленным SEO-описанием;
- страницы статей получили блок `О чём этот разбор` и автоматическую подборку связанных проектов;
- metadata и JSON-LD на уровне сайта, статей и проектов переписаны под язык инженерных кейсов и экспертных разборов.

## Ключевые решения

- Основной слой доверия для поиска и LLM-краулеров теперь дают проекты, а статьи работают как supporting evidence и экспертные пояснения.
- Для AI-краулеров разделены два режима:
  - `llms.txt` — короткая карта сайта с приоритетными страницами;
  - `llms-full.txt` — расширенная версия с большим объёмом сущностей.
- На project pages добавлена нормализация `shortDescription`, чтобы пустые значения из CMS не портили title/description, Open Graph и FAQ-ответы.
- В article pages связанные проекты выбираются автоматически по пересечению тегов и технологий, с приоритетом technology match.

## Внешние эффекты

- Поисковики и AI-краулеры получают более явную структуру сайта: кто автор, какие кейсы приоритетны, какие статьи подтверждают экспертизу.
- Проекты стали самостоятельными landing pages для брендового и экспертного спроса.
- Статьи и кейсы начали лучше поддерживать друг друга внутренними связями.

## Файлы

- `packages/web/src/lib/llms.ts`
- `packages/web/src/app/llms.txt/route.ts`
- `packages/web/src/app/llms-full.txt/route.ts`
- `packages/web/src/app/page.tsx`
- `packages/web/src/components/sections/Hero.tsx`
- `packages/web/src/components/sections/Projects.tsx`
- `packages/web/src/components/sections/ArticlesNews.tsx`
- `packages/web/src/app/projects/[slug]/page.tsx`
- `packages/web/src/components/projects/ProjectCaseStudy.tsx`
- `packages/web/src/app/articles/[slug]/page.tsx`
- `packages/web/src/components/articles/RelatedProjects.tsx`
- `packages/web/src/lib/seo.ts`
- `packages/web/src/app/layout.tsx`

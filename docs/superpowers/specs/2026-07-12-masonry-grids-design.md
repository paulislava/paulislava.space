# Masonry-раскладка для сеток проектов и статей

## Проблема

Сетки проектов и статей используют CSS Grid (`grid grid-cols-*`), который растягивает все карточки в строке под высоту самой высокой. Нужно, чтобы каждая карточка сохраняла собственную высоту.

## Подход

Чистый CSS masonry через multi-column layout (`columns-*` + `break-inside-avoid`), без JS-библиотек — не требует зависимостей, не вызывает layout shift/CLS при гидратации.

Компромисс: карточки заполняют колонки сверху вниз по одной, затем переходят к следующей (не построчно слева направо, как в JS-масонри-библиотеках). Для сеток из 3–9 карточек это визуально малозаметно.

## Изменения

Во всех 5 местах: заменить `grid grid-cols-*` на `columns-*` с теми же брейкпоинтами, на карточках добавить `break-inside-avoid` и `mb-<gap>` (в column-layout `gap` задаёт только зазор между колонками, вертикальный отступ внутри колонки — через margin).

| Файл | Контейнер: было → стало |
|---|---|
| `packages/web/src/app/projects/ProjectsClient.tsx` | `grid sm:grid-cols-2 lg:grid-cols-3 gap-6` → `columns-1 sm:columns-2 lg:columns-3 gap-6` |
| `packages/web/src/app/articles/ArticlesClient.tsx` | `grid sm:grid-cols-2 lg:grid-cols-3 gap-6` → `columns-1 sm:columns-2 lg:columns-3 gap-6` |
| `packages/web/src/components/sections/ArticlesNews.tsx` | `grid sm:grid-cols-2 lg:grid-cols-3 gap-5` → `columns-1 sm:columns-2 lg:columns-3 gap-5` |
| `packages/web/src/components/articles/RelatedProjects.tsx` | `grid grid-cols-1 sm:grid-cols-2 gap-4` → `columns-1 sm:columns-2 gap-4` |
| `packages/web/src/components/ui/RelatedArticles.tsx` | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` → `columns-1 sm:columns-2 lg:columns-3 gap-4` |

Карточки, требующие `break-inside-avoid mb-<gap>` на корневом `<Link>`:
- Инлайн-карточки в `ProjectsClient.tsx`, `ArticlesClient.tsx`, `RelatedArticles.tsx` — `mb-6`/`mb-6`/`mb-4` соответственно.
- `packages/web/src/components/ui/ProjectCard.tsx` (используется только в `RelatedProjects.tsx`) — `mb-4`.
- `packages/web/src/components/ui/ArticleCard.tsx` (используется только в `ArticlesNews.tsx`) — `mb-5`.

Существующие `flex flex-col flex-1 mt-auto` внутри карточек не трогаем — без построчного растяжения они не создают побочных эффектов, каждая карточка примет естественную высоту.

## Вне рамок

- Не выносим дублирующуюся разметку карточек в общий компонент (6 независимых реализаций carda уже существуют в коде — это отдельная задача, не связанная с масонри).
- Карусель проектов на главной (`components/sections/Projects.tsx`, Swiper) не грид — не трогаем.

## Проверка

`npm run dev:web`, визуально проверить `/projects`, `/articles` и разделы с ArticlesNews/RelatedProjects/RelatedArticles на разных ширинах экрана (мобилка/tablet/desktop) — карточки должны идти без разрывов внутри, без пустых полос снизу.

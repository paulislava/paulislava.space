# Отдельная обложка для страницы статьи/проекта

## Проблема

У `article` и `project` есть одно поле `cover`, используемое одновременно как обложка в списках/карточках и как hero-изображение на детальной странице. Изображение, подходящее для карточки в сетке, не всегда подходит для полноширинного hero-блока на странице.

## Решение

Добавить в CMS отдельное поле обложки для детальной страницы и флаг, разрешающий использовать общую обложку как fallback.

### Логика выбора обложки на странице

Приоритет (первое непустое значение побеждает):
1. `pageCover`, если задан
2. общая `cover`, если `showCoverOnPage === true`
3. иначе — обложки на странице нет

Общая `cover` в карточках/списках (`ArticleCard`, `ProjectCard`, related-блоки, серии) не меняется — там всегда используется поле `cover`, независимо от `pageCover`/`showCoverOnPage`.

Open Graph (`og:image`) и JSON-LD (`articleJsonLd`, `projectJsonLd`) не меняются — они и сейчас всегда берут общую `cover`, это поведение сохраняется намеренно (единообразие превью в соцсетях/мессенджерах вне зависимости от настройки страницы).

## Изменения

### 1. CMS-схема

В `packages/cms/src/api/article/content-types/article/schema.json` и `packages/cms/src/api/project/content-types/project/schema.json` добавить рядом с существующим `cover`:

```json
"pageCover": {
  "type": "media",
  "multiple": false,
  "allowedTypes": ["images"]
},
"showCoverOnPage": {
  "type": "boolean",
  "default": false
}
```

### 2. GraphQL

В `packages/web/src/graphql/articles.graphql` (`GetArticleBySlug`) и `packages/web/src/graphql/projects.graphql` (`GetProjectBySlug`) добавить в тело запроса (не в общий `*CardFields` фрагмент, чтобы не тянуть лишнее в списки):

```graphql
pageCover {
  ...MediaFields
}
showCoverOnPage
```

### 3. Типы

В `packages/web/src/lib/strapi-types.ts`:
- В `Article` и `Project` добавить `pageCover: StrapiMedia | null` и `showCoverOnPage: boolean`.
- Добавить хелпер:

```ts
export function resolvePageCover<T extends { cover: StrapiMedia | null; pageCover: StrapiMedia | null; showCoverOnPage: boolean }>(
  entity: T,
): StrapiMedia | null {
  if (entity.pageCover) return entity.pageCover;
  if (entity.showCoverOnPage) return entity.cover;
  return null;
}
```

### 4. Страницы

- `packages/web/src/app/articles/[slug]/page.tsx`: заменить `mediaUrl(article.cover, 'large') ?? mediaUrl(article.cover)` на `mediaUrl(resolvePageCover(article), 'large') ?? mediaUrl(resolvePageCover(article))`.
- `packages/web/src/app/projects/[slug]/page.tsx`: аналогично для `project`.
- `generateMetadata` в обоих файлах и `lib/seo.ts` (`articleJsonLd`, `projectJsonLd`) не трогать — продолжают использовать `article.cover`/`project.cover`.

### 5. Codegen

После правки схемы: поднять CMS (`docker-compose up -d database cms`), выполнить `npm run generate` в `packages/web` для перегенерации `src/gql/graphql.ts`.

## Вне скоупа

- `news` (у него тоже есть `cover`) — пользователь просил только статьи и проекты.
- Изменение отображения обложки в карточках/списках.
- Изменение OG/JSON-LD логики.

## Тестирование

Ручная проверка в браузере после реализации:
1. Статья/проект без `pageCover` и без `showCoverOnPage` — на странице обложки нет.
2. `showCoverOnPage = true`, `pageCover` не задан — на странице показывается общая `cover`.
3. Задан `pageCover` — на странице показывается именно он, независимо от `showCoverOnPage`.
4. В списках/карточках всегда используется общая `cover`, независимо от новых полей.

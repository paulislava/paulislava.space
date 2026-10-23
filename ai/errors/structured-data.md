# Небезопасный вывод JSON-LD и недостоверные поля

Дата: 2026-10-23

## Симптомы и причина

JSON-LD статей, новостей, проектов и общего layout вставлялся через прямой `JSON.stringify`. Строка CMS с `</script>` могла закрыть HTML-элемент со структурированными данными. Отдельного общего безопасного сериализатора не было.

`dateModified` повторял дату публикации вместо даты обновления CMS. Общие обложки-заглушки попадали в `image`. При расширении разметки обнаружено, что скрытая обложка карточки также не должна становиться `primaryImageOfPage`.

## Решение

Общий компонент `JsonLd` экранирует `<` как `\u003c`. GraphQL-запросы получают `updatedAt`; недостоверные даты и обновления раньше публикации опускаются. Разметка использует реальные медиа, а главное изображение страницы учитывает настройки отображения обложки. Защита сериализации, хронология дат, отсутствие подставных изображений и скрытые обложки проверяются регрессионными тестами.

## Файлы

- `packages/web/src/lib/seo.ts`
- `packages/web/src/components/seo/JsonLd.tsx`
- `packages/web/src/graphql/articles.graphql`, `packages/web/src/graphql/news.graphql`
- `packages/web/src/gql/graphql.ts`, `packages/web/src/lib/strapi-types.ts`
- Страницы и `packages/web/tests/seo.test.mjs`

Подробности внедрения и production-проверок: [structured-data.md](../features/structured-data.md).

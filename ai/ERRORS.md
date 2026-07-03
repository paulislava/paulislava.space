# ERRORS

Задокументированные ошибки, их причины и решения.

---

## TypeORM migration: column "camelCaseColumn" does not exist

**Ошибка:**
```
QueryFailedError: column "recieverId" does not exist
```

**Причина:**
Проект использует `SnakeNamingStrategy` из `typeorm-naming-strategies` (см. `packages/backend/src/app/database/database.module.ts`). TypeORM автоматически преобразует все имена столбцов в snake_case при работе через ORM. Однако в миграциях SQL пишется вручную — и если в запросе указать camelCase-имя (`"recieverId"`, `"createdAt"`), PostgreSQL не найдёт такой столбец.

**Решение:**
В SQL-запросах внутри миграций всегда использовать snake_case:

| camelCase (TypeScript) | snake_case (SQL в миграции) |
|---|---|
| `recieverId` | `reciever_id` |
| `senderId` | `sender_id` |
| `anonymousSenderId` | `anonymous_sender_id` |
| `createdAt` | `created_at` |
| `recieverReadAt` | `reciever_read_at` |
| `anonymousNumber` | `anonymous_number` |

**Правило:** при написании любого SQL в миграциях — имена столбцов всегда в snake_case, даже если в сущности поле называется в camelCase.

---

## Двойной скролл в чатах (web)

**Ошибка:**
На странице `/messages` экран меньше страницы — двойной лагающий скролл на мобильных устройствах.

**Причина:**
`body` имел `min-height: 100vh` без `overflow: hidden`, что позволяло самому body скроллироваться. При этом внутри `Navigation` чат-layout рисовал `h-dvh overflow-hidden` контейнер, который тоже скроллировался. Итог — два уровня скролла одновременно.

**Решение:**
1. `globals.css`: `html` получил `height: 100dvh; overflow: hidden`, `body` — `height: 100%; overflow: hidden` (убрано `min-height: 100vh`)
2. `Navigation.tsx`: внешний wrapper теперь всегда `h-full`, не-чат страницы обёрнуты в `<div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>` вместо прямого рендера `PageContainer` — это переносит скролл с body на этот div.

**Файлы:**
- `packages/web/src/app/globals.css`
- `packages/web/src/components/Navigation/Navigation.tsx`

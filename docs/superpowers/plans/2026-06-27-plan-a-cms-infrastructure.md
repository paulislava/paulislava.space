# paulislava.space — Plan A: CMS & Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять монорепо с Strapi v5 CMS, Docker-окружением, CI/CD (GitHub Actions) и nginx-конфигурацией для paulislava.space. После выполнения этого плана CMS работает на `cms.paulislava.space`, данные из резюме загружены, CI/CD деплоит автоматически при пуше в master.

**Architecture:** Монорепо с `packages/cms` (Strapi v5, PostgreSQL, S3) и минимальным `packages/web` (пустой Next.js scaffold). Docker Compose для локальной разработки. GitHub Actions собирает Docker-образы → push в GHCR → SSH deploy на `beznomera.net`.

**Tech Stack:** Strapi v5, Next.js 15, PostgreSQL 18 (системный), Docker, GitHub Actions, nginx (HestiaCP), S3 (beget.cloud), Node.js 20.

## Global Constraints

- Node.js >= 20 везде
- Strapi v5 (`@strapi/strapi@^5`) — не v4
- Next.js 15 App Router
- Все запросы к Strapi только server-side — нет `NEXT_PUBLIC_STRAPI_*`
- Web-контейнер: порт `4200` на хосте → `3000` в контейнере
- CMS-контейнер: `--network host`, порт `1337`
- PostgreSQL: системный сервис на сервере, база `paulislava_cms`, пользователь `paulislava_cms`
- S3 bucket: `4565b9a17706-stylish-albert`, endpoint `https://s3.ru1.storage.beget.cloud`, region `ru-msk`
- CDN public URL: `https://cdn.paulislava.space`
- Имена docker-контейнеров: `paulislava_cms`, `paulislava_web`
- nginx app conf: `/home/user/conf/web/paulislava.space/nginx.ssl.conf_app`
- CMS nginx app conf: `/home/user/conf/web/cms.paulislava.space/nginx.ssl.conf_app`

---

## File Map

```
paulislava.space/
├── packages/
│   ├── cms/                          ← Task 2–5
│   │   ├── src/api/
│   │   │   ├── technology/content-types/technology/schema.json   ← Task 3
│   │   │   ├── tag/content-types/tag/schema.json                 ← Task 3
│   │   │   ├── work-experience/content-types/work-experience/schema.json  ← Task 3
│   │   │   ├── project/content-types/project/schema.json         ← Task 3
│   │   │   ├── article/content-types/article/schema.json         ← Task 3
│   │   │   └── news/content-types/news/schema.json               ← Task 3
│   │   ├── config/
│   │   │   ├── database.ts                                        ← Task 2
│   │   │   ├── plugins.ts                                         ← Task 4
│   │   │   ├── middlewares.ts                                     ← Task 5
│   │   │   └── server.ts                                          ← Task 2
│   │   ├── .env.example                                           ← Task 2
│   │   └── Dockerfile                                             ← Task 7
│   └── web/                          ← Task 6 (scaffold only)
│       ├── src/app/
│       │   ├── page.tsx              ← placeholder
│       │   ├── layout.tsx
│       │   └── api/health/route.ts   ← health check endpoint
│       ├── .env.example
│       └── Dockerfile                ← Task 7
├── scripts/
│   └── seed.ts                       ← Task 8
├── docker-compose.yml                ← Task 9
├── nginx/
│   ├── paulislava.conf               ← Task 10 (paulislava.space)
│   └── cms.conf                      ← Task 10 (cms.paulislava.space)
├── package.json                      ← Task 1
├── .gitignore                        ← Task 1
└── .github/workflows/
    └── ci.yml                        ← Task 11
```

---

## Task 1: Initialize monorepo

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.npmrc`

**Interfaces:**
- Produces: npm workspaces `packages/cms`, `packages/web`

- [ ] **Step 1: Create root package.json с npm workspaces**

```json
{
  "name": "paulislava-space",
  "private": true,
  "workspaces": [
    "packages/cms",
    "packages/web"
  ],
  "scripts": {
    "dev:cms": "npm run dev --workspace=packages/cms",
    "dev:web": "npm run dev --workspace=packages/web",
    "build": "npm run build --workspace=packages/cms && npm run build --workspace=packages/web"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```gitignore
node_modules/
.env
.env.local
.DS_Store
dist/
build/
.next/
packages/cms/.tmp/
packages/cms/public/uploads/
*.log
```

- [ ] **Step 3: Create .npmrc (legacy peer deps для совместимости)**

```
legacy-peer-deps=true
```

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore .npmrc
git commit -m "chore: initialize monorepo structure"
```

---

## Task 2: Инициализация Strapi v5

**Files:**
- Create: `packages/cms/` (через create-strapi CLI)
- Modify: `packages/cms/config/database.ts`
- Modify: `packages/cms/config/server.ts`
- Create: `packages/cms/.env.example`

**Interfaces:**
- Produces: работающий Strapi dev-сервер на порту 1337 с PostgreSQL

- [ ] **Step 1: Инициализировать Strapi v5 в packages/cms**

```bash
npx create-strapi@latest packages/cms \
  --typescript \
  --no-run \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=paulislava_cms \
  --dbusername=paulislava_cms \
  --dbpassword=PLACEHOLDER \
  --no-example
```

Если CLI спрашивает интерактивно — выбрать: TypeScript, PostgreSQL, без quickstart.

- [ ] **Step 2: Заменить packages/cms/config/database.ts**

```ts
export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'paulislava_cms'),
      user: env('DATABASE_USERNAME', 'paulislava_cms'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false)
        ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }
        : false,
    },
    debug: false,
  },
});
```

- [ ] **Step 3: Заменить packages/cms/config/server.ts**

```ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
```

- [ ] **Step 4: Создать packages/cms/.env.example**

```env
# App
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=change_me
ADMIN_JWT_SECRET=change_me
TRANSFER_TOKEN_SALT=change_me
JWT_SECRET=change_me

# Database
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=paulislava_cms
DATABASE_USERNAME=paulislava_cms
DATABASE_PASSWORD=change_me
DATABASE_SSL=false

# S3
S3_ACCESS_KEY_ID=0ZM9AEFDEJPE0GKE66GX
S3_SECRET_ACCESS_KEY=change_me
S3_BUCKET=4565b9a17706-stylish-albert
S3_REGION=ru-msk
S3_ENDPOINT=https://s3.ru1.storage.beget.cloud
CDN_BASE_URL=https://cdn.paulislava.space
```

- [ ] **Step 5: Проверить запуск локально**

```bash
cd packages/cms
cp .env.example .env
# Заполнить DATABASE_PASSWORD и секреты
npm run develop
```

Ожидается: Strapi Admin открывается на `http://localhost:1337/admin`

- [ ] **Step 6: Commit**

```bash
git add packages/cms
git commit -m "feat(cms): initialize Strapi v5 with PostgreSQL"
```

---

## Task 3: Создание схем контентных типов

**Files:**
- Create: `packages/cms/src/api/technology/content-types/technology/schema.json`
- Create: `packages/cms/src/api/tag/content-types/tag/schema.json`
- Create: `packages/cms/src/api/work-experience/content-types/work-experience/schema.json`
- Create: `packages/cms/src/api/project/content-types/project/schema.json`
- Create: `packages/cms/src/api/article/content-types/article/schema.json`
- Create: `packages/cms/src/api/news/content-types/news/schema.json`

Для каждого типа Strapi генерирует также `controllers/`, `routes/`, `services/` — оставить дефолтные файлы без изменений (CRUD уже работает через Strapi).

**Interfaces:**
- Produces: 6 content types, доступных через REST API на `/api/<plural>`

- [ ] **Step 1: Сгенерировать заготовки через Strapi CLI**

```bash
cd packages/cms

npx strapi generate content-type
# technology → коллекция → поля вводить не нужно (Enter на пустом поле)

# Повторить для каждого:
# tag, work-experience, project, article, news
```

Или создать директории вручную:
```bash
for type in technology tag work-experience project article news; do
  mkdir -p src/api/$type/content-types/$type
  mkdir -p src/api/$type/controllers
  mkdir -p src/api/$type/routes
  mkdir -p src/api/$type/services
done
```

- [ ] **Step 2: Записать schema.json для technology**

`packages/cms/src/api/technology/content-types/technology/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "technologies",
  "info": {
    "singularName": "technology",
    "pluralName": "technologies",
    "displayName": "Technology",
    "description": ""
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "icon": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "websiteUrl": { "type": "string" },
    "category": {
      "type": "enumeration",
      "enum": ["Frontend", "Backend", "DevOps", "Database", "Other"],
      "default": "Other",
      "required": true
    },
    "workExperiences": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::work-experience.work-experience",
      "mappedBy": "technologies"
    },
    "projects": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::project.project",
      "mappedBy": "technologies"
    },
    "articles": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::article.article",
      "mappedBy": "technologies"
    },
    "news": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::news.news",
      "mappedBy": "technologies"
    }
  }
}
```

- [ ] **Step 3: Записать schema.json для tag**

`packages/cms/src/api/tag/content-types/tag/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "tags",
  "info": {
    "singularName": "tag",
    "pluralName": "tags",
    "displayName": "Tag",
    "description": ""
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "color": { "type": "string", "default": "#6366f1" },
    "category": {
      "type": "enumeration",
      "enum": ["project", "news", "article"],
      "required": true
    }
  }
}
```

- [ ] **Step 4: Записать schema.json для work-experience**

`packages/cms/src/api/work-experience/content-types/work-experience/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "work_experiences",
  "info": {
    "singularName": "work-experience",
    "pluralName": "work-experiences",
    "displayName": "Work Experience",
    "description": ""
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "title": { "type": "string", "required": true },
    "company": { "type": "string", "required": true },
    "companyUrl": { "type": "string" },
    "startDate": { "type": "date", "required": true },
    "endDate": { "type": "date" },
    "description": { "type": "blocks" },
    "technologies": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::technology.technology",
      "inversedBy": "workExperiences"
    },
    "logo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "isRemote": { "type": "boolean", "default": false },
    "location": { "type": "string" }
  }
}
```

- [ ] **Step 5: Записать schema.json для project**

`packages/cms/src/api/project/content-types/project/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "projects",
  "info": {
    "singularName": "project",
    "pluralName": "projects",
    "displayName": "Project",
    "description": ""
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "shortDescription": { "type": "string" },
    "description": { "type": "blocks" },
    "url": { "type": "string" },
    "githubUrl": { "type": "string" },
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "screenshots": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    "technologies": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::technology.technology",
      "inversedBy": "projects"
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag"
    },
    "featured": { "type": "boolean", "default": false },
    "news": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::news.news",
      "mappedBy": "projects"
    }
  }
}
```

- [ ] **Step 6: Записать schema.json для article**

`packages/cms/src/api/article/content-types/article/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article",
    "description": ""
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "excerpt": { "type": "string" },
    "content": { "type": "blocks" },
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag"
    },
    "technologies": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::technology.technology",
      "inversedBy": "articles"
    }
  }
}
```

- [ ] **Step 7: Записать schema.json для news**

`packages/cms/src/api/news/content-types/news/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "news_items",
  "info": {
    "singularName": "news",
    "pluralName": "news",
    "displayName": "News",
    "description": ""
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "excerpt": { "type": "string" },
    "content": { "type": "blocks" },
    "cover": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::tag.tag"
    },
    "technologies": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::technology.technology",
      "inversedBy": "news"
    },
    "projects": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::project.project",
      "inversedBy": "news"
    }
  }
}
```

- [ ] **Step 8: Создать дефолтные controller/route/service для каждого типа**

Для каждого из 6 типов создать три файла (пример для `technology`, повторить для остальных):

`packages/cms/src/api/technology/controllers/technology.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::technology.technology');
```

`packages/cms/src/api/technology/routes/technology.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::technology.technology');
```

`packages/cms/src/api/technology/services/technology.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::technology.technology');
```

Повторить для: `tag`, `work-experience`, `project`, `article`, `news` — заменяя `technology` на соответствующее имя.

- [ ] **Step 9: Перезапустить Strapi и проверить типы**

```bash
cd packages/cms && npm run develop
```

Ожидается: в Strapi Admin → Content-Type Builder видны все 6 типов с правильными полями.

- [ ] **Step 10: Commit**

```bash
git add packages/cms/src/api
git commit -m "feat(cms): add content type schemas (technology, tag, work-experience, project, article, news)"
```

---

## Task 4: S3 upload plugin

**Files:**
- Modify: `packages/cms/package.json` (добавить зависимость)
- Create: `packages/cms/config/plugins.ts`

**Interfaces:**
- Produces: медиафайлы Strapi загружаются на `s3.ru1.storage.beget.cloud`, доступны через `cdn.paulislava.space`

- [ ] **Step 1: Установить S3 upload provider**

```bash
cd packages/cms
npm install @strapi/provider-upload-aws-s3
```

- [ ] **Step 2: Создать packages/cms/config/plugins.ts**

```ts
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_BASE_URL', 'https://cdn.paulislava.space'),
        rootPath: '',
        s3Options: {
          region: env('S3_REGION', 'ru-msk'),
          endpoint: env('S3_ENDPOINT', 'https://s3.ru1.storage.beget.cloud'),
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
          },
          forcePathStyle: true,
        },
        params: {
          Bucket: env('S3_BUCKET', '4565b9a17706-stylish-albert'),
          ACL: 'public-read',
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

- [ ] **Step 3: Проверить загрузку файла**

Запустить `npm run develop`, зайти в Strapi Admin → Media Library → Upload. Загрузить любое изображение. Убедиться, что URL файла начинается с `https://cdn.paulislava.space/`.

- [ ] **Step 4: Commit**

```bash
git add packages/cms/config/plugins.ts packages/cms/package.json packages/cms/package-lock.json
git commit -m "feat(cms): configure S3 upload provider with CDN"
```

---

## Task 5: Strapi middlewares и публичные права доступа

**Files:**
- Create: `packages/cms/config/middlewares.ts`

**Interfaces:**
- Produces: REST API `/api/*` доступно публично для чтения (GET), CORS настроен

- [ ] **Step 1: Создать packages/cms/config/middlewares.ts**

```ts
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'cdn.paulislava.space',
            '*.storage.beget.cloud',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'cdn.paulislava.space',
            '*.storage.beget.cloud',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'https://paulislava.space',
        'https://www.paulislava.space',
        'https://cms.paulislava.space',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

- [ ] **Step 2: Настроить публичные права в Strapi Admin**

После запуска `npm run develop`:
1. Strapi Admin → Settings → Users & Permissions → Roles → Public
2. Для каждого content type (`technology`, `tag`, `work-experience`, `project`, `article`, `news`) включить: `find`, `findOne`
3. Save

- [ ] **Step 3: Создать API Token для seed-скрипта и Next.js**

Strapi Admin → Settings → API Tokens → Create new API Token:
- Name: `next-web`
- Token type: `Read-only`
- Скопировать токен в `.env` как `STRAPI_API_TOKEN`

- [ ] **Step 4: Commit**

```bash
git add packages/cms/config/middlewares.ts
git commit -m "feat(cms): configure CORS and security middlewares"
```

---

## Task 6: Next.js scaffold (placeholder)

**Files:**
- Create: `packages/web/` (через create-next-app)
- Create: `packages/web/src/app/api/health/route.ts`
- Create: `packages/web/.env.example`

**Interfaces:**
- Produces: Next.js приложение на порту 3000 с `/api/health` endpoint для CI health check

- [ ] **Step 1: Инициализировать Next.js 15**

```bash
npx create-next-app@latest packages/web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias
```

- [ ] **Step 2: Создать health endpoint**

`packages/web/src/app/api/health/route.ts`:
```ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

- [ ] **Step 3: Заменить packages/web/src/app/page.tsx на placeholder**

```tsx
export default function Home() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f', color: '#f1f5f9', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>paulislava.space</h1>
        <p>Coming soon...</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Создать packages/web/.env.example**

```env
# Strapi (server-side only — не должно начинаться с NEXT_PUBLIC_)
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=change_me

# Contact form
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=i@paulislava.space
SMTP_PASS=change_me
CONTACT_EMAIL=i@paulislava.space

# ISR revalidation secret
REVALIDATE_SECRET=change_me
```

- [ ] **Step 5: Проверить запуск**

```bash
cd packages/web && npm run dev
```

Ожидается: `http://localhost:3000` — placeholder, `http://localhost:3000/api/health` — `{"status":"ok"}`

- [ ] **Step 6: Commit**

```bash
git add packages/web
git commit -m "feat(web): initialize Next.js 15 scaffold with health endpoint"
```

---

## Task 7: Dockerfiles

**Files:**
- Create: `packages/cms/Dockerfile`
- Create: `packages/web/Dockerfile`

**Interfaces:**
- Produces: Docker-образы для обоих сервисов

- [ ] **Step 1: Создать packages/cms/Dockerfile**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/dist ./dist
COPY --from=build /app/.strapi ./.strapi
COPY package.json ./

EXPOSE 1337
# Strapi v5 build output: dist/server.js (проверить после первого build)
CMD ["node", "dist/server.js"]
```

- [ ] **Step 2: Создать packages/web/Dockerfile**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 3: Включить standalone output в packages/web/next.config.ts**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.paulislava.space'],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Commit**

```bash
git add packages/cms/Dockerfile packages/web/Dockerfile packages/web/next.config.ts
git commit -m "feat: add Dockerfiles for cms and web"
```

---

## Task 8: Seed-скрипт

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/package.json`

**Interfaces:**
- Consumes: `STRAPI_URL`, `STRAPI_API_TOKEN` из env
- Produces: заполненная база данных — технологии, теги, места работы, проект BEZNOMERA

- [ ] **Step 1: Создать scripts/package.json**

```json
{
  "name": "paulislava-scripts",
  "private": true,
  "type": "module",
  "scripts": {
    "seed": "npx tsx seed.ts"
  },
  "dependencies": {
    "tsx": "^4.0.0"
  }
}
```

- [ ] **Step 2: Создать scripts/seed.ts**

```ts
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function post(endpoint: string, data: unknown) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${endpoint} failed: ${res.status} ${text}`);
  }
  return (await res.json()).data;
}

async function main() {
  console.log('🌱 Starting seed...');

  // --- Technologies ---
  const techs: Record<string, number> = {};
  const techList = [
    { name: 'React', category: 'Frontend' },
    { name: 'React Native', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Redux', category: 'Frontend' },
    { name: 'GraphQL', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'NestJS', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Strapi', category: 'Backend' },
    { name: 'PHP', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'RabbitMQ', category: 'Backend' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'GitHub Actions', category: 'DevOps' },
    { name: 'GitLab CI', category: 'DevOps' },
    { name: 'Nginx', category: 'DevOps' },
    { name: 'Linux', category: 'DevOps' },
    { name: 'S3', category: 'DevOps' },
    { name: 'TypeORM', category: 'Backend' },
    { name: 'Telegraf', category: 'Backend' },
    { name: 'WebDAV', category: 'Backend' },
    { name: 'Webpack', category: 'Frontend' },
    { name: 'REST', category: 'Backend' },
    { name: 'Swagger', category: 'Backend' },
    { name: 'MDX', category: 'Frontend' },
    { name: 'Hestia', category: 'DevOps' },
  ];

  for (const tech of techList) {
    const created = await post('technologies', tech);
    techs[tech.name] = created.id;
    console.log(`  ✓ Technology: ${tech.name}`);
  }

  // --- Tags ---
  const tags = [
    { name: 'Web', category: 'project', color: '#6366f1' },
    { name: 'Mobile', category: 'project', color: '#06b6d4' },
    { name: 'Telegram', category: 'project', color: '#0ea5e9' },
    { name: 'Open Source', category: 'project', color: '#10b981' },
    { name: 'MVP', category: 'project', color: '#f59e0b' },
    { name: 'SberDevices', category: 'news', color: '#22c55e' },
    { name: 'Релиз', category: 'news', color: '#a855f7' },
    { name: 'Разработка', category: 'article', color: '#6366f1' },
    { name: 'DevOps', category: 'article', color: '#f97316' },
    { name: 'Архитектура', category: 'article', color: '#ec4899' },
  ];

  for (const tag of tags) {
    await post('tags', tag);
    console.log(`  ✓ Tag: ${tag.name}`);
  }

  // --- Work Experiences ---
  const workExperiences = [
    {
      title: 'Архитектор',
      company: 'BEZNOMERA',
      companyUrl: 'https://beznomera.net',
      startDate: '2025-01-01',
      endDate: null,
      isRemote: true,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Придумал, спроектировал и разработал мини-приложение в Telegram, веб-сайт и чат-бот для соцсети для водителей BEZNOMERA. Проект позволяет водителю оставить QR-код ведущий на персональный профиль автомобиля анонимно.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React Native', 'React', 'Next.js', 'NestJS', 'S3', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Telegraf', 'TypeORM'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Техлид, DevOps',
      company: 'Kursoved.Pro',
      companyUrl: 'https://kursoved.pro',
      startDate: '2024-05-01',
      endDate: null,
      isRemote: true,
      location: 'Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Ответственный за DevOps (CI/CD, администрирование сервера) и техлид клиентской части проекта. Архитектурно определяю взаимодействие серверной и клиентской части.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React', 'Docker', 'GitLab CI', 'Linux', 'TypeScript', 'Swagger', 'Hestia'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Senior-разработчик, техлид команды',
      company: 'SberDevices',
      startDate: '2022-10-01',
      endDate: null,
      isRemote: true,
      location: 'Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Разработка сайта нейросети Gigachat и портала для разработчиков Сбера. Создание визуального MDX-редактора для технических писателей. Техлид команды, проведение code-review, менторство стажёров.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['React', 'Next.js', 'GraphQL', 'Express.js', 'Strapi', 'TypeScript', 'Docker', 'Nginx', 'Redis', 'MDX'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Техлид проекта',
      company: 'Брусника',
      startDate: '2022-03-01',
      endDate: '2022-10-01',
      isRemote: false,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Разработка и доработка функционала внутреннего сервиса BIM.Себестоимость. Интеграции с внутренними и внешними сервисами (тендерная площадка, электронный документооборот).',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['TypeScript', 'Node.js', 'Redux', 'React', 'PostgreSQL', 'RabbitMQ', 'Swagger', 'Nginx', 'Webpack', 'WebDAV'].includes(name))
        .map(([, id]) => id),
    },
    {
      title: 'Ведущий разработчик, тимлид',
      company: 'УрФУ',
      startDate: '2018-09-01',
      endDate: '2022-03-01',
      isRemote: false,
      location: 'Екатеринбург, Россия',
      description: [
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Проектирование и разработка веб-сайтов и сервисов УрФУ. Создание сервиса мониторинга изменений контента с интеграцией в Mattermost. Управление разработкой, администрирование серверов.',
          }],
        },
      ],
      technologies: Object.entries(techs)
        .filter(([name]) => ['PHP', 'JavaScript', 'Python', 'PostgreSQL', 'Linux', 'Docker'].includes(name))
        .map(([, id]) => id),
    },
  ];

  for (const exp of workExperiences) {
    const { technologies, ...rest } = exp;
    const created = await post('work-experiences', {
      ...rest,
      technologies: technologies.length > 0 ? technologies : undefined,
    });
    console.log(`  ✓ Work Experience: ${exp.title} at ${exp.company} (id: ${created.id})`);
  }

  // --- Project: BEZNOMERA ---
  await post('projects', {
    title: 'BEZNOMERA',
    shortDescription: 'Социальная сеть для водителей с Telegram Mini App, чат-ботом и QR-кодами',
    url: 'https://beznomera.net',
    featured: true,
    description: [
      {
        type: 'paragraph',
        children: [{
          type: 'text',
          text: 'Мини-приложение в Telegram, веб-сайт и чат-бот для соцсети водителей. Позволяет разместить QR-код на автомобиле для анонимной связи с владельцем через персональный профиль. Реализованы статистика, ролевая модель, кастомизация страницы авто, CI/CD на self-hosted GitHub Actions.',
        }],
      },
    ],
    technologies: Object.entries(techs)
      .filter(([name]) => ['React Native', 'React', 'Next.js', 'NestJS', 'S3', 'PostgreSQL', 'Docker', 'GitHub Actions', 'Telegraf', 'TypeORM'].includes(name))
      .map(([, id]) => id),
  });
  console.log('  ✓ Project: BEZNOMERA');

  console.log('\n✅ Seed complete!');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Установить зависимости**

```bash
cd scripts && npm install
```

- [ ] **Step 4: Проверить скрипт локально**

```bash
# Убедиться что Strapi запущен с публичным API Token
STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=<token> npx tsx seed.ts
```

Ожидается: все строки с `✓`, финальное `✅ Seed complete!`

- [ ] **Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: add seed script with resume data"
```

---

## Task 9: Docker Compose (локальная разработка)

**Files:**
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: `docker compose up` поднимает database + cms + web

- [ ] **Step 1: Создать docker-compose.yml**

```yaml
version: '3.9'

services:
  database:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: paulislava_cms
      POSTGRES_USER: paulislava_cms
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U paulislava_cms']
      interval: 10s
      timeout: 5s
      retries: 5

  cms:
    build:
      context: ./packages/cms
      dockerfile: Dockerfile
      target: build
    command: npm run develop
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    environment:
      DATABASE_HOST: database
      DATABASE_PORT: 5432
      DATABASE_NAME: paulislava_cms
      DATABASE_USERNAME: paulislava_cms
      DATABASE_PASSWORD: ${DB_PASSWORD:-devpassword}
      APP_KEYS: ${CMS_APP_KEYS:-key1,key2,key3,key4}
      API_TOKEN_SALT: ${CMS_API_TOKEN_SALT:-devtoken}
      ADMIN_JWT_SECRET: ${CMS_ADMIN_JWT_SECRET:-devadminsecret}
      JWT_SECRET: ${CMS_JWT_SECRET:-devjwtsecret}
      TRANSFER_TOKEN_SALT: ${CMS_TRANSFER_TOKEN_SALT:-devtransfer}
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
      S3_BUCKET: ${S3_BUCKET:-4565b9a17706-stylish-albert}
      S3_REGION: ru-msk
      S3_ENDPOINT: https://s3.ru1.storage.beget.cloud
      CDN_BASE_URL: https://cdn.paulislava.space
    volumes:
      - ./packages/cms/src:/app/src
      - ./packages/cms/config:/app/config
    ports:
      - '1337:1337'

  web:
    build:
      context: ./packages/web
      dockerfile: Dockerfile
      target: builder
    command: npm run dev
    restart: unless-stopped
    depends_on:
      - cms
    environment:
      STRAPI_URL: http://cms:1337
      STRAPI_API_TOKEN: ${STRAPI_API_TOKEN}
      REVALIDATE_SECRET: ${REVALIDATE_SECRET:-devsecret}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT:-465}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      CONTACT_EMAIL: i@paulislava.space
    volumes:
      - ./packages/web/src:/app/src
    ports:
      - '3000:3000'

volumes:
  postgres_data:
```

- [ ] **Step 2: Создать .env.example в корне**

```env
# Docker Compose
DB_PASSWORD=devpassword

# CMS
CMS_APP_KEYS=key1,key2,key3,key4
CMS_API_TOKEN_SALT=change_me
CMS_ADMIN_JWT_SECRET=change_me
CMS_JWT_SECRET=change_me
CMS_TRANSFER_TOKEN_SALT=change_me

# S3
S3_ACCESS_KEY_ID=0ZM9AEFDEJPE0GKE66GX
S3_SECRET_ACCESS_KEY=change_me
S3_BUCKET=4565b9a17706-stylish-albert

# Web
STRAPI_API_TOKEN=change_me
REVALIDATE_SECRET=change_me

# Email
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=i@paulislava.space
SMTP_PASS=change_me
```

- [ ] **Step 3: Проверить**

```bash
cp .env.example .env
# Заполнить S3_SECRET_ACCESS_KEY и пароли
docker compose up database cms
```

Ожидается: `cms.paulislava.space` поднимается, Strapi Admin доступен на `localhost:1337/admin`.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "feat: add docker-compose for local development"
```

---

## Task 10: nginx конфиги

**Files:**
- Create: `nginx/paulislava.conf`
- Create: `nginx/cms.conf`

**Interfaces:**
- Produces: nginx проксирует paulislava.space → 4200, cms.paulislava.space → 1337

**Prerequisite (ручной шаг перед деплоем):** Добавить subdomain `cms.paulislava.space` через HestiaCP Admin на сервере. После создания появится `/home/user/conf/web/cms.paulislava.space/nginx.ssl.conf_app`.

- [ ] **Step 1: Создать nginx/paulislava.conf**

```nginx
location / {
    proxy_pass http://0.0.0.0:4200;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 60s;
}
```

- [ ] **Step 2: Создать nginx/cms.conf**

```nginx
location / {
    proxy_pass http://0.0.0.0:1337;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 120s;
    client_max_body_size 100m;
}
```

- [ ] **Step 3: Commit**

```bash
git add nginx/
git commit -m "feat: add nginx proxy configs for paulislava.space and cms subdomain"
```

---

## Task 11: GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: GitHub Secrets (см. список ниже)
- Produces: автоматический деплой при push в master

**Secrets, которые нужно создать в GitHub → Settings → Secrets:**

| Secret | Значение |
|---|---|
| `SERVER_SSH_KEY` | приватный SSH ключ для root@beznomera.net |
| `CMS_APP_KEYS` | 4 случайных строки через запятую |
| `CMS_API_TOKEN_SALT` | случайная строка 32+ символа |
| `CMS_ADMIN_JWT_SECRET` | случайная строка 32+ символа |
| `CMS_JWT_SECRET` | случайная строка 32+ символа |
| `CMS_TRANSFER_TOKEN_SALT` | случайная строка 32+ символа |
| `DATABASE_URL` | `postgres://paulislava_cms:<pass>@localhost:5432/paulislava_cms` |
| `S3_ACCESS_KEY_ID` | `0ZM9AEFDEJPE0GKE66GX` |
| `S3_SECRET_ACCESS_KEY` | ключ S3 |
| `STRAPI_API_TOKEN` | токен из Strapi Admin |
| `STRAPI_URL` | `http://localhost:1337` (на сервере внутренний адрес) |
| `REVALIDATE_SECRET` | случайная строка |
| `SMTP_HOST` | `smtp.mail.ru` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `i@paulislava.space` |
| `SMTP_PASS` | пароль от почты |

**Variables (GitHub → Settings → Variables):**

| Variable | Значение |
|---|---|
| `CMS_ENV` | полный .env файл для Strapi (base64) |
| `WEB_ENV` | полный .env файл для Next.js (base64) |

- [ ] **Step 1: Создать .github/workflows/ci.yml**

```yaml
name: CI/CD

on:
  push:
    branches:
      - master
  workflow_dispatch:
    inputs:
      deploy:
        description: 'Deploy after build'
        required: false
        default: 'true'
        type: choice
        options:
          - 'true'
          - 'false'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-cms:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push CMS image
        uses: docker/build-push-action@v6
        with:
          context: ./packages/cms
          file: ./packages/cms/Dockerfile
          push: true
          tags: |
            ghcr.io/paulislava/paulislava.space:cms-${{ github.sha }}
            ghcr.io/paulislava/paulislava.space:cms-latest
          cache-from: type=gha,scope=cms
          cache-to: type=gha,mode=max,scope=cms

  build-web:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Web image
        uses: docker/build-push-action@v6
        with:
          context: ./packages/web
          file: ./packages/web/Dockerfile
          push: true
          tags: |
            ghcr.io/paulislava/paulislava.space:web-${{ github.sha }}
            ghcr.io/paulislava/paulislava.space:web-latest
          build-args: |
            STRAPI_URL=http://localhost:1337
            STRAPI_API_TOKEN=${{ secrets.STRAPI_API_TOKEN }}
            REVALIDATE_SECRET=${{ secrets.REVALIDATE_SECRET }}
          cache-from: type=gha,scope=web
          cache-to: type=gha,mode=max,scope=web

  deploy-cms:
    runs-on: ubuntu-latest
    needs: build-cms
    if: github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.deploy == 'true')
    steps:
      - name: Prepare CMS env
        id: cms-env
        env:
          CMS_ENV: ${{ vars.CMS_ENV }}
        run: echo "b64=$(printf '%s' "$CMS_ENV" | base64 -w 0)" >> $GITHUB_OUTPUT

      - name: Deploy CMS
        uses: appleboy/ssh-action@v1.2.0
        env:
          GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GHCR_ACTOR: ${{ github.actor }}
          IMAGE_TAG: ${{ github.sha }}
          ENV_B64: ${{ steps.cms-env.outputs.b64 }}
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          envs: GHCR_TOKEN,GHCR_ACTOR,IMAGE_TAG,ENV_B64
          script: |
            echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_ACTOR" --password-stdin
            docker pull ghcr.io/paulislava/paulislava.space:cms-$IMAGE_TAG
            docker stop paulislava_cms || true
            docker rm -f paulislava_cms || true
            echo "$ENV_B64" | base64 -d > /tmp/paulislava-cms.env
            docker run --name paulislava_cms -d --network host \
              --env-file /tmp/paulislava-cms.env \
              ghcr.io/paulislava/paulislava.space:cms-$IMAGE_TAG
            rm -f /tmp/paulislava-cms.env

      - name: Health check CMS
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            for i in $(seq 1 10); do
              if ! docker inspect --format='{{.State.Running}}' paulislava_cms 2>/dev/null | grep -q 'true'; then
                echo "CMS container stopped on attempt $i"
                docker logs paulislava_cms --tail=100 2>&1 || true
                exit 1
              fi
              STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:1337/_health 2>/dev/null || echo "000")
              if [ "$STATUS" = "204" ] || [ "$STATUS" = "200" ]; then
                echo "CMS healthy on attempt $i"
                exit 0
              fi
              echo "Attempt $i/10: CMS not ready (HTTP $STATUS), waiting 15s..."
              sleep 15
            done
            echo "CMS failed health check"
            docker logs paulislava_cms --tail=100 2>&1 || true
            exit 1

  deploy-web:
    runs-on: ubuntu-latest
    needs:
      - build-web
      - deploy-cms
    if: github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.deploy == 'true')
    steps:
      - name: Prepare Web env
        id: web-env
        env:
          WEB_ENV: ${{ vars.WEB_ENV }}
        run: echo "b64=$(printf '%s' "$WEB_ENV" | base64 -w 0)" >> $GITHUB_OUTPUT

      - name: Deploy Web
        uses: appleboy/ssh-action@v1.2.0
        env:
          GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GHCR_ACTOR: ${{ github.actor }}
          IMAGE_TAG: ${{ github.sha }}
          ENV_B64: ${{ steps.web-env.outputs.b64 }}
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          envs: GHCR_TOKEN,GHCR_ACTOR,IMAGE_TAG,ENV_B64
          script: |
            echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_ACTOR" --password-stdin
            docker pull ghcr.io/paulislava/paulislava.space:web-$IMAGE_TAG
            docker stop paulislava_web || true
            docker rm -f paulislava_web || true
            echo "$ENV_B64" | base64 -d > /tmp/paulislava-web.env
            docker run --name paulislava_web -d -p 4200:3000 \
              --env-file /tmp/paulislava-web.env \
              ghcr.io/paulislava/paulislava.space:web-$IMAGE_TAG
            rm -f /tmp/paulislava-web.env

      - name: Health check Web
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            for i in $(seq 1 10); do
              if ! docker inspect --format='{{.State.Running}}' paulislava_web 2>/dev/null | grep -q 'true'; then
                echo "Web container stopped on attempt $i"
                docker logs paulislava_web --tail=100 2>&1 || true
                exit 1
              fi
              STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:4200/api/health 2>/dev/null || echo "000")
              if [ "$STATUS" = "200" ]; then
                echo "Web healthy on attempt $i"
                exit 0
              fi
              echo "Attempt $i/10: Web not ready (HTTP $STATUS), waiting 15s..."
              sleep 15
            done
            echo "Web failed health check"
            docker logs paulislava_web --tail=100 2>&1 || true
            exit 1

  deploy-nginx:
    runs-on: ubuntu-latest
    needs:
      - deploy-web
    if: github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.deploy == 'true')
    steps:
      - uses: actions/checkout@v4

      - name: Encode nginx configs
        id: nginx
        run: |
          echo "paulislava=$(base64 -w 0 nginx/paulislava.conf)" >> $GITHUB_OUTPUT
          echo "cms=$(base64 -w 0 nginx/cms.conf)" >> $GITHUB_OUTPUT

      - name: Deploy nginx configs
        uses: appleboy/ssh-action@v1.2.0
        env:
          PAULISLAVA_CONF: ${{ steps.nginx.outputs.paulislava }}
          CMS_CONF: ${{ steps.nginx.outputs.cms }}
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          envs: PAULISLAVA_CONF,CMS_CONF
          script: |
            PAULISLAVA_APP="/home/user/conf/web/paulislava.space/nginx.ssl.conf_app"
            CMS_APP="/home/user/conf/web/cms.paulislava.space/nginx.ssl.conf_app"
            cp "$PAULISLAVA_APP" /tmp/paulislava-nginx.bak 2>/dev/null || true
            cp "$CMS_APP" /tmp/cms-nginx.bak 2>/dev/null || true
            echo "$PAULISLAVA_CONF" | base64 -d > "$PAULISLAVA_APP"
            if [ -f "$CMS_APP" ]; then
              echo "$CMS_CONF" | base64 -d > "$CMS_APP"
            fi
            if nginx -t; then
              systemctl restart nginx
              echo "✓ nginx reloaded"
              rm -f /tmp/paulislava-nginx.bak /tmp/cms-nginx.bak
            else
              echo "✗ nginx config invalid, rolling back"
              mv /tmp/paulislava-nginx.bak "$PAULISLAVA_APP" 2>/dev/null || true
              mv /tmp/cms-nginx.bak "$CMS_APP" 2>/dev/null || true
              systemctl restart nginx || true
              exit 1
            fi

  clean:
    runs-on: ubuntu-latest
    needs:
      - deploy-cms
      - deploy-web
      - deploy-nginx
    if: always() && (github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.deploy == 'true'))
    steps:
      - name: Clean up Docker
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: beznomera.net
          username: root
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker image prune -f
            docker container prune -f
```

- [ ] **Step 2: Создать базу данных на сервере (одноразовый ручной шаг)**

```bash
ssh root@beznomera.net
sudo -u postgres psql <<EOF
CREATE USER paulislava_cms WITH PASSWORD 'your_strong_password';
CREATE DATABASE paulislava_cms OWNER paulislava_cms;
GRANT ALL PRIVILEGES ON DATABASE paulislava_cms TO paulislava_cms;
EOF
```

- [ ] **Step 3: Добавить cms.paulislava.space в HestiaCP (ручной шаг)**

Зайти в HestiaCP Admin Panel → Web → Add Web Domain → `cms.paulislava.space`. Это создаст конфиг файлы в `/home/user/conf/web/cms.paulislava.space/`.

- [ ] **Step 4: Добавить GitHub Secrets и Variables**

Создать все secrets/variables из таблицы в Task 11 через GitHub → Repository → Settings → Secrets and variables → Actions.

`CMS_ENV` Variable содержит `.env` файл для Strapi:
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=<4 ключа через запятую>
API_TOKEN_SALT=<случайная строка>
ADMIN_JWT_SECRET=<случайная строка>
JWT_SECRET=<случайная строка>
TRANSFER_TOKEN_SALT=<случайная строка>
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=paulislava_cms
DATABASE_USERNAME=paulislava_cms
DATABASE_PASSWORD=<пароль БД>
DATABASE_SSL=false
S3_ACCESS_KEY_ID=0ZM9AEFDEJPE0GKE66GX
S3_SECRET_ACCESS_KEY=<ключ S3>
S3_BUCKET=4565b9a17706-stylish-albert
S3_REGION=ru-msk
S3_ENDPOINT=https://s3.ru1.storage.beget.cloud
CDN_BASE_URL=https://cdn.paulislava.space
```

`WEB_ENV` Variable содержит `.env` файл для Next.js:
```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=<токен из Strapi Admin>
REVALIDATE_SECRET=<случайная строка>
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=i@paulislava.space
SMTP_PASS=<пароль от почты>
CONTACT_EMAIL=i@paulislava.space
```

- [ ] **Step 5: Создать репозиторий на GitHub и запушить**

```bash
git remote add origin git@github.com:paulislava/paulislava.space.git
git push -u origin master
```

Ожидается: GitHub Actions запускается, все джобы зелёные, `paulislava.space` показывает placeholder, `cms.paulislava.space/admin` — Strapi Admin.

- [ ] **Step 6: Commit CI/CD**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add GitHub Actions CI/CD with separate deploy and health checks"
```

---

## Итог Plan A

После выполнения всех задач:

- ✅ `cms.paulislava.space/admin` — Strapi Admin с 6 типами контента
- ✅ Media Library загружает файлы на `cdn.paulislava.space`
- ✅ `paulislava.space` — placeholder (заменяется в Plan B)
- ✅ `git push → master` автоматически деплоит через CI/CD
- ✅ Seed-скрипт заполняет технологии, теги, опыт работы и первый проект

**Следующий шаг:** Plan B — Next.js frontend (все секции, анимации, страницы, SEO).

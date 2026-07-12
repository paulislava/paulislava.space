# paulislava.space — Design Spec

**Date:** 2026-06-27  
**Status:** Approved

---

## Overview

Иммерсивный сайт-визитка для Павла Кондратова (Software Engineer) с headless CMS Strapi v5, Next.js 15 фронтендом, CI/CD по аналогии с beznomera.net и CDN через S3 (cdn.paulislava.space).

---

## 1. Структура репозитория (монорепо)

```
paulislava.space/
├── packages/
│   ├── cms/                          ← Strapi v5 (TypeScript)
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── work-experience/
│   │   │   │   ├── project/
│   │   │   │   ├── article/
│   │   │   │   ├── news/
│   │   │   │   ├── tag/
│   │   │   │   └── technology/
│   │   │   └── extensions/
│   │   ├── config/
│   │   │   └── plugins.ts            ← S3 upload provider
│   │   └── Dockerfile
│   └── web/                          ← Next.js 15 (App Router)
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           ← лендинг (все секции)
│       │   │   ├── projects/[slug]/page.tsx
│       │   │   ├── articles/[slug]/page.tsx
│       │   │   ├── news/[slug]/page.tsx
│       │   │   └── api/
│       │   │       ├── revalidate/route.ts   ← вебхук от Strapi
│       │   │       └── contact/route.ts      ← форма обратной связи
│       │   ├── components/
│       │   │   ├── sections/          ← Hero, About, Experience, Skills,
│       │   │   │                         Projects, Articles, Contact
│       │   │   └── ui/                ← Card, Slider, AnimatedText, Tag, etc.
│       │   └── lib/
│       │       └── strapi.ts          ← типизированный API-клиент
│       └── Dockerfile
├── scripts/
│   └── seed.ts                        ← наполнение данными через Strapi REST API
├── docker-compose.yml                 ← локальная разработка
├── nginx/
│   └── production.conf                ← paulislava.space + cms.paulislava.space
└── .github/workflows/
    └── ci.yml
```

---

## 2. Strapi CMS — схемы контента

### work-experience
| Поле | Тип | Описание |
|---|---|---|
| `title` | string | Должность |
| `company` | string | Название компании |
| `companyUrl` | string | Сайт компании (опц.) |
| `startDate` | date | Начало |
| `endDate` | date | Конец (null = текущая) |
| `description` | blocks | Richtext |
| `technologies` | relation m2m | → technology |
| `logo` | media | CDN |
| `isRemote` | boolean | |
| `location` | string | |

### project
| Поле | Тип | Описание |
|---|---|---|
| `title` | string | |
| `slug` | uid | |
| `shortDescription` | string | Для карточки |
| `description` | blocks | Richtext |
| `url` | string | Опц. |
| `githubUrl` | string | Опц. |
| `cover` | media | CDN |
| `screenshots` | media (multiple) | Слайдер |
| `technologies` | relation m2m | → technology |
| `tags` | relation m2m | → tag |
| `featured` | boolean | Показывать на главной |

### article
| Поле | Тип | Описание |
|---|---|---|
| `title` | string | |
| `slug` | uid | |
| `excerpt` | string | Для карточки |
| `content` | blocks | Richtext |
| `cover` | media | CDN |
| `tags` | relation m2m | → tag |
| `technologies` | relation m2m | → technology |

### news
Идентичная структура с `article`, плюс:

| Поле | Тип | Описание |
|---|---|---|
| `projects` | relation m2m | → project (новость привязана к проекту) |

На странице `/projects/[slug]` отображается блок "Новости проекта" — все новости, связанные с этим проектом.

### technology
| Поле | Тип | Описание |
|---|---|---|
| `name` | string | |
| `slug` | uid | |
| `icon` | media | SVG/PNG, CDN |
| `websiteUrl` | string | Опц. |
| `category` | enum | Frontend / Backend / DevOps / Database / Other |

### tag (единый для всех типов)
| Поле | Тип | Описание |
|---|---|---|
| `name` | string | |
| `slug` | uid | |
| `color` | string | HEX |
| `category` | enum | `project` / `news` / `article` |

---

## 3. Next.js Frontend

### Стек
- **Next.js 15** — App Router, React Server Components
- **Tailwind CSS v4**
- **GSAP + ScrollTrigger** — parallax hero, scroll animations, счётчики
- **Framer Motion** — page transitions между роутами
- **Swiper.js** — слайдеры проектов и screenshots
- **Three.js** (опц.) — анимированный фон на hero (канвас/частицы)

### Цветовая схема (dark tech / glassmorphism)
- Фон: `#0a0a0f`
- Акцент primary: `#6366f1` (indigo)
- Акцент secondary: `#06b6d4` (cyan)
- Glassmorphism карточки: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)`
- Текст: `#f1f5f9`

### Главная страница `/` — 7 секций

1. **Hero** — полноэкранный, имя + роль с typewriter-эффектом, анимированный фон (сетка/частицы), CTA "Проекты" / "Связаться"
2. **About** — bio, статистика (лет опыта, хакатонов, конференций) с анимацией счётчиков при scroll-in
3. **Experience** — вертикальный таймлайн мест работы, glassmorphism-карточки с лого и стеком
4. **Skills** — сетка иконок технологий, сгруппированных по категориям, hover-эффекты
5. **Projects** — горизонтальный Swiper-слайдер с featured-проектами: cover, название, теги, стек, ссылки
6. **Articles & News** — две вкладки, карточки с cover + excerpt + теги, ссылка на полную страницу
7. **Contact** — форма (имя, email, сообщение) → отправка на `i@paulislava.space` через Next.js API route + SMTP/Resend

### Отдельные страницы
- `/projects/[slug]` — hero с cover, Swiper screenshots, full richtext, стек, ссылки, блок "Новости проекта"
- `/articles/[slug]` — читабельная статья, cover, теги, технологии, related
- `/news/[slug]` — аналогично статьям

### Получение данных (ISR)
- Все запросы к Strapi — только серверные (RSC, route handlers). Никаких `NEXT_PUBLIC_*` переменных для Strapi, никакого клиентского fetch к CMS.
- `fetch` с `next: { tags: ['projects'] }` и т.п., переменная `STRAPI_URL` доступна только на сервере
- `revalidateTag()` вызывается из `/api/revalidate` при вебхуке Strapi
- `generateStaticParams` для slug-страниц

### SEO
- `generateMetadata` для каждой страницы (title, description, og:image)
- OpenGraph images из cover или дефолтный og-image
- JSON-LD Schema: `Person` на главной, `Article` на страницах статей
- `sitemap.ts` — динамический sitemap через Strapi API
- `robots.ts`

---

## 4. CI/CD (GitHub Actions)

Файл: `.github/workflows/ci.yml`. Триггер: `push → master`, `workflow_dispatch`.

```
build-cms  ──────────────────────────────────┐
                                              ├── deploy-cms (health-check)
build-web  ──┬──────────────────────────────────── deploy-web (needs: build-web + deploy-cms)
             │                                         ↓ health-check
             │                                     deploy-nginx
             └─────────────────────────────────────────────┘
                                                    clean (always)
```

**deploy-cms:**
- SSH → pull `ghcr.io/paulislava/paulislava.space:cms-$SHA`
- `docker stop paulislava_cms || true && docker rm -f paulislava_cms || true`
- `docker run --name paulislava_cms -d --network host ... `
- Health check: `curl localhost:1337/_health` × 10 попыток × 15s

**deploy-web:**
- SSH → pull `ghcr.io/paulislava/paulislava.space:web-$SHA`
- `docker stop paulislava_web || true && docker rm -f paulislava_web || true`
- `docker run --name paulislava_web -d -p 4200:3000 ...`
- Health check: `curl localhost:4200/health` × 10 попыток × 15s

**deploy-nginx:**
- Кодирует `nginx/production.conf` в base64 → SSH → декодирует
- Резервная копия текущего конфига
- `nginx -t` — тест; откат при провале
- `systemctl restart nginx`

**clean:** `docker image prune -f && docker container prune -f`

### GitHub Secrets
`SERVER_SSH_KEY`, `CMS_APP_KEYS`, `CMS_JWT_SECRET`, `CMS_ADMIN_JWT_SECRET`, `CMS_TRANSFER_TOKEN_SALT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `STRAPI_URL` (server-side only, не exposed в браузер), `STRAPI_API_TOKEN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`, `DATABASE_URL`

---

## 5. Инфраструктура на сервере

**Docker-контейнеры:**
- `paulislava_cms` → `localhost:1337` (Strapi, `--network host`, подключается к системному PostgreSQL)
- `paulislava_web` → `localhost:4200` (Next.js)

**nginx (paulislava.space):**
- `paulislava.space` → proxy `localhost:4200`
- `cms.paulislava.space` → proxy `localhost:1337`

**S3/CDN:**
- Bucket: `4565b9a17706-stylish-albert` @ `s3.ru1.storage.beget.cloud`
- Public URL: `cdn.paulislava.space`
- Strapi upload provider: `@strapi/provider-upload-aws-s3`

**База данных:**
- PostgreSQL 18 — системный сервис на сервере (как у beznomera)
- Контейнер `paulislava_cms` запускается с `--network host` → подключается к `localhost:5432`
- База данных: `paulislava_cms`, пользователь: `paulislava_cms` — создаётся вручную один раз перед первым деплоем
- Credentials передаются через GitHub Secret `DATABASE_URL`

---

## 6. Seed-скрипт

`scripts/seed.ts` — запускается один раз:

```bash
docker exec paulislava_cms node /app/scripts/seed.js
```

Наполняет через Strapi REST API:
- Технологии: React, TypeScript, Node.js, Next.js, NestJS, PostgreSQL, Docker, Redis, RabbitMQ, GraphQL, Nginx и др.
- Места работы: BEZNOMERA, Kursoved.Pro, SberDevices, Brusnika, УрФУ
- Теги проектов: Web, Mobile, Telegram, Open Source и др.
- Проект BEZNOMERA (с описанием из резюме)

---

## 7. Локальная разработка

```bash
# Запустить весь стек
docker compose up

# Или отдельно
docker compose up database cms
docker compose up web
```

**Порты по умолчанию:**
| Сервис | Порт |
|---|---|
| Next.js Web | 3000 |
| Strapi CMS | 1337 |
| PostgreSQL | 5432 |

Горячая перезагрузка работает для обоих сервисов.

---

## 8. Скриншоты для карточек проектов

Playwright в CI (отдельный workflow `screenshots.yml`, запускается вручную):
1. Открывает URL проекта
2. Делает скриншот(ы) ключевых страниц
3. Загружает через Strapi API в медиатеку (→ CDN)
4. Обновляет поле `screenshots` записи проекта

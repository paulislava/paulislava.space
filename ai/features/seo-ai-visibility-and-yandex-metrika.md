# SEO, AI-видимость и Яндекс Метрика

## Что реализовано

Добавлен технический слой для продвижения сайта в поиске и нейросетях:

- создан счётчик Яндекс Метрики `110323550` для `paulislava.space`;
- создана цель Метрики `Отправка формы` с идентификатором `contact_form_success`;
- подключён скрипт Метрики на все страницы;
- форма контакта отправляет `reachGoal('contact_form_success')` только после успешного ответа `/api/contact`;
- добавлен `llms.txt` с машинно-читаемой картой сайта для AI-краулеров и ассистентов;
- расширен `robots.txt` явными правилами для AI-краулеров;
- добавлена JSON-LD разметка `Person`, `WebSite`, `BlogPosting`, `NewsArticle`, `CreativeWork`;
- добавлены canonical/OG поля для динамических страниц статей, новостей и проектов;
- добавлен HTML-файл подтверждения Яндекс Вебмастера `yandex_70377de81fc69849.html`.

## Ключевые решения

- ID Метрики хранится как public fallback `110323550`; при необходимости его можно переопределить через `NEXT_PUBLIC_YANDEX_METRIKA_ID`.
- Цель формы сделана JS-событием, а не автоцелью, чтобы фиксировать только реально успешную отправку формы.
- `llms.txt` генерируется динамически из Strapi и обновляется с `revalidate = 1800`.
- `/api/` остаётся закрытым для обычных и AI-краулеров.

## Внешние действия

- В Метрике создан счётчик `110323550`.
- В Метрике создана цель `contact_form_success`.
- В Яндекс Вебмастер добавлен сайт `https://paulislava.space`.
- Для подтверждения прав Яндекс Вебмастер ожидает деплой файла `/yandex_70377de81fc69849.html`.

## Файлы

- `packages/web/src/components/analytics/YandexMetrika.tsx`
- `packages/web/src/lib/metrika.ts`
- `packages/web/src/lib/seo.ts`
- `packages/web/src/app/llms.txt/route.ts`
- `packages/web/src/app/layout.tsx`
- `packages/web/src/components/sections/Contact.tsx`
- `packages/web/src/app/articles/[slug]/page.tsx`
- `packages/web/src/app/news/[slug]/page.tsx`
- `packages/web/src/app/projects/[slug]/page.tsx`
- `packages/web/src/app/robots.ts`
- `packages/web/public/yandex_70377de81fc69849.html`

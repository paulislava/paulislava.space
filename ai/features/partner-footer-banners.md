# Баннеры партнёрских сайтов

Дата: 2026-10-02.

## Использование

В Strapi → Content Manager → «Баннеры сайтов» создать запись: `name`, полный HTTP(S) `websiteUrl`, при необходимости `brandText` и цвета `#RRGGBB`. Сохранить, опубликовать и скопировать автоматически заполненный `embedHtml` в футер сайта. `bannerKey` стабилен и генерируется сервером; вручную задавать его не требуется. URL сайта нормализуется до origin, без пути, секретных query и fragment.

Поле `gif` оставить пустым для автоматической генерации по опубликованным настройкам. Загруженная картинка заменяет автоматическую. Настройки доступны только для опубликованных записей. `enabled=false` убирает JS-баннер и отдаёт прозрачный GIF. Обновление на сторонних сайтах возможно с задержкой до 60 секунд из-за HTTP-кеша.

## Поведение

Полный баннер 300×44, GIF 600×88. Надписи циклически стираются и печатаются: «Создано PaulIsLava», «Заказать автоматизацию», «Заказать сайт», «Заказать чат-бот», «Заказать разработку». При смене услуг сохраняется «Заказать ». Префиксы всегда нейтральные, бренд и каждая услуга имеют отдельный цвет, включая промежуточные кадры. Курсор мигает и в JS, и в GIF.

JS начинает первую смену после двух секунд непрерывной полной видимости, приостанавливается вне экрана и в скрытой вкладке, учитывает reduced motion. GIF содержит начальную задержку две секунды и `loading=lazy`; без JavaScript точный момент полной видимости определить нельзя.

В исходном HTML всегда присутствует обычная ссылка с текстом и описанием услуг для поисковых роботов и парсеров. `noscript` показывает GIF с alt внутри той же ссылки. Индексация ссылки сама по себе не гарантирует рост позиций.

Переход: `/zakazat-sait-avtomatizaciyu`, временный 307 на главную с сохранением query. UTM: `utm_source=<hostname сайта>`, `utm_medium=footer_banner`, `utm_campaign=made_by_paulislava`, `utm_content=<bannerKey>`.

## Генерация GIF

Next.js `/api/banners/[key]/image` читает публичную конфигурацию Strapi. Noto Sans Bold (SIL OFL) преобразуется через opentype.js в SVG paths, sharp растеризует кадры, gifenc собирает бесконечный GIF. Это работает в Alpine без системных шрифтов. Генерации сериализованы; кеш до 16 комбинаций настроек, параллельные запросы объединяются. Неизвестная запись или недоступная CMS ведут на базовый `/banner.gif`.

`/api/banners/[key]` возвращает опубликованную конфигурацию с CORS; Strapi `/api/footer-banners/config/:key` отдаёт ограниченную публичную проекцию без административных полей.

## Метрика

Счётчик 110323550: цель «Переход с сайта партнёра», JavaScript-событие `partner_banner_visit`, ID 667287339. На входе с medium=footer_banner и непустым source отправляются partner_site, banner, campaign. Обычные посещения не вызывают эту цель.

## Проверки

- `node scripts/banner/check.cjs`: видимость, задержка, пауза, нейтральные префиксы, цвета, цикл, условия цели Метрики.
- Сборки CMS и Web; CI/CD https://github.com/paulislava/paulislava.space/actions/runs/37033181412 — success.
- Production: временная опубликованная запись, GIF89a, повторное использование кеша, изменение фона по прежнему URL, удаление тестовой записи.
- Браузер: Content Manager открывается; переход сохраняет UTM; запрос цели partner_banner_visit получил HTTP 200.

## Файлы

- `packages/web/public/banner.js`, `banner.gif`, `banner-embed.html`, `banner-preview.html`
- `packages/web/public/fonts/NotoSans-Bold.ttf`, `NotoSans-LICENSE.txt`
- `packages/web/src/lib/banner-config.ts`, `banner-gif.ts`
- `packages/web/src/app/api/banners/[key]/route.ts`, `image/route.ts`
- `packages/web/src/components/analytics/YandexMetrika.tsx`, `packages/web/next.config.ts`
- `packages/cms/src/api/footer-banner/`, `packages/cms/src/index.ts`
- `scripts/banner/generate-gif.py`, `scripts/banner/check.cjs`

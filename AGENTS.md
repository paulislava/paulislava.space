# Инструкции проекта paulislava.space

## Скиллы проекта

На запрос «баннер для сайта <домен>» прочитай и выполни [.agents/skills/site-banner/SKILL.md](.agents/skills/site-banner/SKILL.md): исследование палитры сайта, публикация настроек в Strapi и выдача готового HTML.

Документация баннеров: [ai/features/partner-footer-banners.md](ai/features/partner-footer-banners.md).

## Микроразметка

Генераторы JSON-LD находятся в `packages/web/src/lib/seo.ts`. Для вывода всегда используй `components/seo/JsonLd.tsx`, который экранирует `<`; прямой `JSON.stringify` внутри HTML-script не используй. Сущности связывай стабильными `@id`, данные разметки согласовывай с отображаемым контентом и текущими фильтрами. Не добавляй вымышленные цены, отзывы, рейтинги или общие изображения-заглушки.

Проверка: `npm run test:seo --workspace=packages/web` (Node.js 22.6+), TypeScript, ESLint изменённых файлов и production-сборка. Для Google-поддерживаемых типов используй Rich Results Test, для остальных — Schema Markup Validator. Подробнее: [ai/features/structured-data.md](ai/features/structured-data.md).


## CMS в РЕЗЕРВЕ (2026-11-17)

`cms.paulislava.space` работает на Windows-ПК `DESKTOP-NGNE28E`. Корень — `E:\Services\PaulislavaCMS`; отдельный WSL2 `PaulislavaCMS` принадлежит LocalService, его VHDX и Docker data-root находятся на E. Docker Desktop для CMS не используется. Windows SCM/NSSM службы `PaulislavaCMS` и `PaulislavaCMSFRP` запускаются автоматически без входа пользователя. Linux Docker/containerd units оставлять disabled; runtime запускает Windows-служба.

База `paulislava_cms` находится в основном Windows PostgreSQL 18 (`postgresql-x64-18`, порт 5432, данные `E:\Projects\vpn\.runtime\postgres-data`), отдельный PostgreSQL-контейнер не создавать. Роль CMS имеет доступ только к своей базе; WSL использует текущий Windows gateway.

Нативный frpc на ПК подключается к `13.143.194.252:7000` с отдельной identity и разрешением только TCP/24005. Nginx на VPN-сервере завершает TLS для CMS и направляет запросы через loopback `127.0.0.1:24005`. Сохранять существующие SNI-маршруты VPN и остальных сервисов.

Исходный резерв `E:\backup` не изменять. Рабочие дампы и результаты проверки — `E:\Services\PaulislavaCMS\backup`; перед обновлением делать новый проверенный pg_dump. Секреты остаются вне Git. Скрипты: `scripts/cms-reserve/`; проверки и восстановление: [ai/features/cms-windows-reserve.md](ai/features/cms-windows-reserve.md).

Старый deploy-cms в GitHub Actions допускается только при явном `CMS_DEPLOY_TARGET=legacy`; не включать его для текущего размещения. Старый workflow больше не устанавливает nginx CMS на прежний VPS. Автоматический деплой новых образов на ПК отдельно не настроен.


## S3/CDN в РЕЗЕРВЕ (2026-11-17)

`cdn.paulislava.space` — новое S3-совместимое хранилище RustFS 1.0.6 на ПК `DESKTOP-NGNE28E`, не Amazon AWS. Корень `E:\Services\PaulislavaS3`, отдельный WSL2 `PaulislavaS3` под LocalService, Docker и данные внутри VHDX на E. Службы `PaulislavaS3` и `PaulislavaS3FRP`, FRP remote port24007 на loopback VPN-сервера.

Endpoint: `https://cdn.paulislava.space`, region `us-east-1`, path-style, bucket `paulislava-media`; публичные файлы — `/<key>`. LAN endpoint `http://192.168.1.125:19000` ограничен подсетью `192.168.1.0/24`, на самом ПК — `http://127.0.0.1:19000`. При смене IP ПК обновить LAN portproxy, firewall и local_endpoint в закрытых access-файлах. Восстановлены 18 файлов изображений Водомера; остальные старые объекты пока отсутствуют.

CMS использует отдельную ограниченную S3-роль, а не административный ключ. В GitHub публичные параметры — Variables; полный `CMS_ENV` и S3 credentials — Secrets. Не переносить секреты обратно в Variables. Для CMS закреплён `cdn.paulislava.space:13.143.194.252` в Docker extra hosts; в S3 WSL сохранён такой же hosts mapping из-за старого DNS-ответа Beget.

Глобальный MCP `aws-s3` подключён в Codex и Claude на Mac и ПК. Код Mac: `~/.local/share/paulislava-s3-mcp`; ПК: `E:\Services\PaulislavaS3\mcp`. Mac использует HTTPS/FRP, ПК — loopback; wrapper `launch.mjs --local` выбирает LAN, `--pc` — loopback. По явной просьбе Павла MCP использует административный ключ. Файлы доступа: Mac `~/.config/paulislava-s3/access.json` (0600), ПК `E:\Services\PaulislavaS3\config\admin-access.json` (закрытый ACL). Значения не выводить и не коммитить; в MCP-конфигах хранить только путь к wrapper/файлу.

Описание, проверки и управление: [ai/features/s3-windows-reserve.md](ai/features/s3-windows-reserve.md). Скрипты: `scripts/s3-reserve/`. Бэкапы CMS и остановленного S3 сохраняются на E, не удалять без разрешения.

## Сайт в РЕЗЕРВЕ (2026-11-17)

`paulislava.space` работает на ПК: `PaulislavaWeb` и `PaulislavaWebFRP`, WSL2 и данные в `E:\Services\PaulislavaWeb`, локальный порт 13000, FRP loopback VPN-сервера 24008. `/proff/` обслуживают отдельные `PaulislavaProff` и `PaulislavaProffFRP`, данные в `E:\Services\PaulislavaProff`, локальный порт 13001, FRP 24009. Публичный TLS и SNI завершаются на VPN-сервере. Автодеплой на ПК не настроен; старый deploy Web допускается только при `WEB_DEPLOY_TARGET=legacy`. Перед push проверять новый дамп CMS. Исходную резервную копию не изменять.

Оригиналы старого S3 и таблица `user_proff.accounts` в доступной копии не найдены: 58 точно сопоставленных изображений восстановлены из Next image cache в S3, другие файлы могут отсутствовать; вход в Proff недоступен. Не считать кеш резервом оригиналов. Подробнее: [ai/features/web-windows-reserve.md](ai/features/web-windows-reserve.md).

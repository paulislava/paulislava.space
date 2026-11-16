# S3/CDN на ПК и административный MCP

Дата: 2026-11-17.

По запросу Павла создано новое пустое S3-совместимое хранилище на Windows-ПК. Это собственный RustFS, не облачное Amazon S3. Объекты старого Beget S3 не восстанавливались и старые записи Media Library не удалялись.

## Размещение и вход

- ПК `DESKTOP-NGNE28E`, корень `E:\Services\PaulislavaS3`.
- WSL2 `PaulislavaS3` под LocalService; VHDX, Docker Engine, образы, `/opt/s3/data`, конфигурации и журналы физически на E.
- Windows SCM/NSSM: `PaulislavaS3`, `PaulislavaS3FRP`, Automatic, LocalService, автоматическое восстановление.
- RustFS 1.0.6: `rustfs/rustfs@sha256:ee717072290bec9b11abfc0365f8310b00df1cd9b3639943edae47bdef05044a`. Контейнер `paulislava_s3`, restart=no, host network, bind `127.0.0.1:19000`, console выключена. Данные и журналы — постоянные bind mounts. Docker bridge/iptables/ip-forward выключены для отдельного daemon. Linux units disabled, lifecycle принадлежит Windows SCM.
- Нативный Windows frpc использует отдельную identity `53335041554C`, точное имя proxy и порт24007. На VPN-сервере `13.143.194.252` frps слушает только loopback. TLS FRP проверяет serverName `tv.paulislava.space` по сохранённому CA.
- Nginx TCP/443 выбирает SNI `cdn.paulislava.space`, направляет его на `127.0.0.1:18450` с PROXY protocol. HTTP-vhost завершает TLS и проксирует на `127.0.0.1:24007`, сохраняя Host и URI для SigV4. HTTP перенаправляется на HTTPS. Certbot выпускает и продлевает отдельный сертификат CDN.
- Существующие VPN/REALITY и другие SNI-маршруты сохранены. RustFS admin API требует подпись; console не опубликована.

## Адреса и права

| Назначение | Адрес |
| --- | --- |
| Удалённый S3 API через HTTPS → FRP → ПК | `https://cdn.paulislava.space` |
| LAN S3 API | `http://192.168.1.125:19000` |
| API на самом ПК | `http://127.0.0.1:19000` |
| Bucket | `paulislava-media` |
| Region | `us-east-1` |
| Публичный файл | `https://cdn.paulislava.space/<key>` |

Nginx на VPN-сервере переписывает публичный путь `/<key>` в `/paulislava-media/<key>` для S3. Пути `/paulislava-media/`, `/minio/` и `/health/` не переписываются. Strapi сохраняет публичный URL без имени bucket; S3 API продолжает использовать path-style.

Используется path-style. LAN portproxy Windows слушает только `192.168.1.125:19000` и передаёт TCP на loopback19000; Windows Firewall допускает источник только `192.168.1.0/24`. IP Helper Automatic. LAN использует HTTP, удалённый вход — HTTPS с проверкой сертификата. При смене LAN IP обновить portproxy, firewall и поле local_endpoint в access-файлах.

Политика bucket разрешает анонимный GetObject, запрещает анонимные listing/write/delete. CMS получила отдельную IAM-роль только для своего bucket: list/location, get/put/delete, ACL для совместимости провайдера, multipart. Роль CMS не может создавать bucket или менять политики. Административный ключ по явному запросу Павла используется только операторским MCP и закрытыми процедурами настройки.

## CMS и GitHub

В `/opt/cms/source.env` изменены только S3 credentials, endpoint, bucket, region и CDN base URL. Предыдущий env сохранён в закрытом backup CMS. Рабочие параметры:

```dotenv
S3_ENDPOINT=https://cdn.paulislava.space
S3_BUCKET=paulislava-media
S3_REGION=us-east-1
CDN_BASE_URL=https://cdn.paulislava.space
```

Полный CMS_ENV перенесён в GitHub Secret. Variable CMS_ENV содержит только несекретные поля. Отдельные Variables: S3_ENDPOINT, S3_BUCKET, S3_REGION, CDN_BASE_URL, CMS_URL, STRAPI_URL, CMS_DEPLOY_TARGET=reserve. S3_ACCESS_KEY_ID и S3_SECRET_ACCESS_KEY обновлены как Secrets ограниченной роли CMS. Административный ключ в GitHub не записывался.

Workflow читает `secrets.CMS_ENV` с совместимым fallback на variable и маскирует его base64-представление. Старый deploy-cms на прежний VPS остаётся выключенным для reserve; автоматический deploy новых образов на ПК этим изменением не добавлялся.

WSL первоначально разрешал CDN в старый Beget S3, вызывая TLSV1_ALERT_INTERNAL_ERROR. Windows DNS и Mac уже возвращали правильный адрес. Для S3 WSL сохранён hosts mapping на13.143.194.252 с generateHosts=false; CMS контейнер получает Docker extra-host. Проверка TLS не отключалась.

## MCP на Mac и ПК

Глобальная запись `aws-s3` добавлена в Codex и Claude на обеих машинах. На Mac общая конфигурация Codex используется также Codex-sokrat. Текущий чат может потребовать повторного открытия для загрузки нового MCP; stdio-подключение отдельно проверено SDK-клиентом из сохранённых конфигураций.

- Mac: `~/.local/share/paulislava-s3-mcp/launch.mjs`, default HTTPS endpoint; `--local` выбирает LAN.
- ПК: `E:\Services\PaulislavaS3\mcp\launch.mjs --pc`, loopback API. Без `--pc` доступен удалённый HTTPS endpoint.
- Ключи Mac: `~/.config/paulislava-s3/access.json`, 0600, каталог0700.
- Ключи ПК: `E:\Services\PaulislavaS3\config\admin-access.json`, закрытый ACL; у Павла явно есть Read, чтобы MCP работал без административного токена Windows. `PAULISLAVA_S3_ACCESS_FILE` указывает путь к файлу.
- Конфигурации MCP содержат command/args и путь к закрытому файлу, не сами ключи. Wrapper передаёт ключи только через environment дочернего процесса и очищает AWS_PROFILE/AWS_DEFAULT_PROFILE/AWS_SESSION_TOKEN, чтобы посторонний профиль не заменил заданный ключ.

Использован [gangadharrr/aws-s3-mcp](https://github.com/gangadharrr/aws-s3-mcp), commit `a74f3b369a76a83dd3d4ab728006e1b1daa54113`, пакет1.0.1. Опубликованный npm-архив не содержал dist, поэтому выполнена сборка из исходников. Минимальный patch задаёт собственный endpoint и forcePathStyle; зависимости обновлены до совместимых исправленных версий, policy schema адаптирована к Zod4. Пакеты зафиксированы lockfile; npm audit на Mac и production audit на ПК —0.

Девять MCP-инструментов: list_buckets, create_bucket, delete_bucket, list_objects, upload_object, download_object, delete_object, get_bucket_policy, set_bucket_policy. Перезапись выполняется upload_object в тот же key. Отдельного copy_object у выбранного MCP нет. Административный ключ разрешает операции со всеми bucket, поэтому применять изменения только в рамках запроса пользователя. Резервные копии не удалять без отдельного разрешения.

## Проверки и резервирование

Выполнены:

- `nginx -t`, frpc verify, actionlint, Bash syntax, PowerShell parse, Python compile.
- 11 S3-проверок: signed PUT с public-read ACL, GET, публичные GET/Range, запрет анонимных list/write/delete, запрет CMS create-bucket/set-policy, multipart с SHA-256, delete. Ключ включает Unicode, пробел и плюс.
- Провайдер из работающего CMS-образа: upload буфера и uploadStream, публичное чтение по сформированному URL, delete и последующий404.
- Stop, cold WSL boot без автоматического запуска приложения/Docker, SCM Start/Restart, восстановление после принудительного завершения только S3 WSL, FRP restart с публичным health200. Canary сохранился после старта и crash recovery; после теста удалён.
- MCP Mac: HTTPS и LAN. MCP ПК: loopback и HTTPS. На каждом пути проверены create/delete bucket, upload/get, overwrite/get, binary upload/download с SHA-256, delete/list.
- SDK-подключение из сохранённой конфигурации Claude на обеих машинах:9 инструментов, list_buckets успешен. Codex configuration проверена на наличие aws-s3.
- Endpoint-test: исходный MCP не включал bucket в URI, после patch тот же тест прошёл. Profile-test: исходный wrapper выбирал посторонний AWS_PROFILE, после очистки env тот же тест прошёл. На Mac и ПК оба теста2/2.

Перед переключением CMS и перед push создан проверенный pg_dump CMS. Snapshot остановленного S3 `/opt/s3/data` и config сохранён в `E:\Services\PaulislavaS3\backup\s3-state-*.tar.gz`, проверен tar listing и SHA-256. Бэкапы и конфигурации клиентов содержат чувствительные данные и остаются вне Git. Старые бэкапы не удалялись.

Физический reboot ПК и интерактивная проверка CMS в Chrome не выполнялись. После проверок CDN health200, CMS health204, обе пары служб Running. Журналы находятся в migration-каталогах соответствующих сервисов.

## Эксплуатация

```powershell
Get-Service PaulislavaS3,PaulislavaS3FRP
Restart-Service PaulislavaS3 -Force
Start-Service PaulislavaS3FRP
Invoke-WebRequest https://cdn.paulislava.space/health/ready -UseBasicParsing
```

При перезапуске runtime зависимый FRP следует снова запустить. Для snapshot сначала остановить запись и runtime, проверить остановку контейнера, сохранить data+config, проверить архив и затем запустить обе службы. Не удалять VHDX, volumes, data или ключи при обновлении образа.

Источники: [RustFS Linux](https://docs.rustfs.com/en/installation/linux), [S3 compatibility](https://docs.rustfs.com/en/reference/s3-compatibility), [IAM](https://docs.rustfs.com/en/security-compliance/iam), [environment](https://docs.rustfs.com/en/reference/environment-variables).

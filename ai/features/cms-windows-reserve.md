# CMS на Windows-ПК через FRP

Дата: 2026-11-17.

CMS доступна по https://cms.paulislava.space/admin. Данные восстановлены из `E:\backup`; исходный резерв сохранён без изменений.

## Размещение

- Windows-ПК `DESKTOP-NGNE28E`, корень `E:\Services\PaulislavaCMS`.
- Отдельный WSL2 `PaulislavaCMS` под `NT AUTHORITY\LocalService`; диск `wsl\ext4.vhdx` на E. Приложение, Docker Engine, образы и `/var/lib/docker` находятся внутри этого диска. Docker Desktop не нужен.
- Основной Windows PostgreSQL 18: служба `postgresql-x64-18`, порт 5432, данные `E:\Projects\vpn\.runtime\postgres-data`. База и роль `paulislava_cms`; роль без superuser/createdb/createrole. Отдельного PostgreSQL-контейнера нет.
- Windows-служба `PaulislavaCMS` через NSSM запускает `/usr/local/bin/cms-windows-service` в WSL. Docker/containerd units отключены от автоматического Linux-старта. Служба запускает Docker, формирует runtime env с текущим Windows gateway и запускает Strapi. После завершения контейнера NSSM повторно запускает службу.
- Stop/Pre вызывает `/usr/local/bin/cms-stop-windows-service`: ставит stop marker и ожидает остановку контейнера. Ключи приложения и S3-настройки сохранены из резервного контейнера в закрытом `/opt/cms/source.env`.
- Роль CMS допускается PostgreSQL из WSL через `pg_hba.conf`; Windows Firewall ограничивает правило TCP/5432 интерфейсом `vEthernet (WSL)`. Остальные сетевые источники не допускаются HBA. При изменении способа сети WSL пересмотреть оба ограничения.

## Публичный вход

Windows-служба `PaulislavaCMSFRP` запускает нативный `frpc.exe` с конфигурацией `config\frpc.toml`. Локальная цель — `127.0.0.1:1337`; Strapi слушает loopback WSL. Подключение идёт к `13.143.194.252:7000`, TLS проверяет `tv.paulislava.space` по сохранённому CA. Отдельная identity `434D53504155` разрешает только свой proxy и TCP/24005.

На VPN-сервере `tv-frps-personal` открывает только `127.0.0.1:24005`. Публичный nginx выбирает CMS по TLS SNI, направляет соединение на `127.0.0.1:18448` с PROXY protocol и завершает TLS сертификатом `cms.paulislava.space`. HTTP перенаправляется на HTTPS, ACME challenge обслуживается отдельно. Обновление сертификата выполняет certbot timer. Nginx передаёт исходные Host, адрес клиента и HTTPS-протокол; поддерживает WebSocket и загрузки до 100 МБ. Существующие маршруты VPN сохранены.

## Восстановление и резервные копии

Исходный production-образ: `ghcr.io/paulislava/paulislava.space:cms-8b818ca6d6d35ebe386fc252e3ade1bdc9de1ca6`. Все 14 filesystem layers совпали с метаданными образа в резерве. Registry digest: `sha256:51b836766c7c4b42b27b6dc19bca1065304c0cf40248050d04083242b0858bc4`.

PostgreSQL восстановлен логическим дампом из изолированной копии кластера `E:\backup\18`. Recovery PostgreSQL остановлен. Временная локаль для чтения исходного кластера находится на E; системная локаль Windows не изменялась. Все 103 таблицы совпали по количеству строк; таблицы принадлежат роли CMS. Медиа используют существующий S3 provider.

Каталог `E:\Services\PaulislavaCMS\backup` закрыт ACL:

- `main-before-cms.sql` — полный дамп основного PostgreSQL перед созданием CMS; завершение дампа проверено.
- `cms-source-pg18.dump` — исходный custom archive; проверен `pg_restore --list`.
- `cms-source-row-counts.json` и `cms-restored-row-verification.json` — результаты сравнения 103 таблиц.
- `cms-restored.dump` и `cms-final-20261117.dump` — дампы восстановленной CMS, проверены `pg_restore --list`.
- Исходные PostgreSQL-конфигурации перед подключением CMS.

SHA-256 исходного дампа: `e726adbc6004efe930642c3801c22726682a2ace9f86ae8f7c5bf8e02b459ab1`.
SHA-256 финального дампа: `13e19284965eaede3ee68db2bee622b65ea3f51a85c1e4f093e7407b9b8b532a`.

Перед следующим обновлением создавать новый датированный pg_dump и проверять архив. Не восстанавливать его поверх действующей базы без отдельного согласования. Бэкапы не удалять без разрешения.

## Управление и проверки

Из административного PowerShell:

```powershell
Get-Service PaulislavaCMS,PaulislavaCMSFRP,postgresql-x64-18
Restart-Service PaulislavaCMS -Force
Start-Service PaulislavaCMSFRP
Invoke-WebRequest https://cms.paulislava.space/_health -UseBasicParsing
```

Перезапуск CMS с `-Force` останавливает зависимый FRP; после него FRP следует запустить. PostgreSQL общий: его перезапуск влияет также на SiestaNet. Docker Desktop и чужие WSL-дистрибутивы не останавливать.

Проверены остановка CMS с завершением контейнера, холодный старт WSL без автоматического запуска CMS/Docker, старт и рестарт Windows-службы, восстановление после принудительной остановки только WSL `PaulislavaCMS`, рестарт FRP с последующим публичным HTTPS 204. Полная физическая перезагрузка ПК не выполнялась. Журнал: `migration\lifecycle.log`.

Публичные проверки: `/admin` 200, JavaScript админки 200, `/admin/init` сообщает существующего администратора, `/_health` 204, GraphQL-запрос `{__typename}` 200. Chrome недоступен через инструмент управления: вход в админку и её интерактивные сценарии в браузере не проверялись.

Конфигурации nginx проверены `nginx -t`, frpc — `verify`; Bash и PowerShell проверены штатными парсерами, workflow — actionlint. Это операционное восстановление без изменения функциональности Strapi; новые unit-тесты не добавлялись.

## Обновление приложения

Скрипты `scripts/cms-reserve` сохраняют текущую конфигурацию служб и проверки. `prepare-runtime.sh` устанавливает Bash wrapper из `migration`, `install-services.ps1` использует закрытый `config\frp-credential.json` и существующие бинарники ПК. Секреты не включены в репозиторий.

GitHub Actions больше не деплоит CMS и её nginx-конфигурацию на прежний VPS по умолчанию. Возврат к старой CMS требует явного `CMS_DEPLOY_TARGET=legacy`; для текущего размещения это значение не задавать. Автоматическое обновление CMS на ПК не настроено. Новый образ необходимо отдельно проверить, сохранить бэкап, загрузить на ПК и обновить ссылку образа в runtime wrapper.


## Изоляция Docker firewall 2026-11-17

В `/etc/docker/daemon.json` установлены `bridge: "none"`, `iptables: false`,
`ip6tables: false`, `ip-forward: false`. Остальные параметры сохранены. Конфиг
проверен `dockerd --validate`; такой же блок добавлен в `prepare-runtime.sh`.
Резерв исходного файла: `/opt/cms/network-recovery-20261117/daemon.json.before`.

Причина: Docker CMS с настройками по умолчанию заменял общие цепочки WSL и
блокировал исходящие подключения контейнера Human4AI. После применения
настройки выполнен запуск CMS при работающем Human4AI: filter/NAT не изменились,
Telegram остался доступен. CMS вернула 204 на `GET /_health`, сайт — 200;
контрольный вопрос Human4AI получил ответ через MCP. Зависимые Web и FRP
службы возвращены в исходное рабочее состояние. PostgreSQL не перезапускался.

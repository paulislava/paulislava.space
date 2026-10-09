# Редирект для свободных поддоменов

С 2026-10-10 wildcard DNS `*.paulislava.space` указывает на сервер `83.222.27.227`. Не настроенные отдельно поддомены возвращают `301` на `https://paulislava.space/zakazat-sait-avtomatizaciyu`. Существующие точные виртуальные хосты nginx имеют приоритет и продолжают обслуживать свои сайты.

## Сервер

- `/etc/nginx/conf.d/paulislava-wildcard-redirect.conf` — wildcard-виртуальный хост для HTTP и HTTPS на обоих IP сервера.
- `/usr/local/hestia/data/templates/web/nginx/careertime-redirect.tpl` и `.stpl` — отдельные шаблоны для `careertime.paulislava.space`, заведённого в Hestia. Оба тоже возвращают 301.
- `/etc/letsencrypt/live/paulislava.space/` — сертификат `*.paulislava.space`, выпущенный через DNS TXT-проверку. Его текущий срок действия до 2027-01-07.

## Продление сертификата

Сертификат выпущен Certbot в ручном режиме DNS-01 через запись `_acme-challenge.paulislava.space` в панели Beget. Автоматического продления нет: до 2027-01-07 нужно повторить DNS-проверку, обновить сертификат и перезагрузить nginx. Проверять срок следует командой `openssl x509 -in /etc/letsencrypt/live/paulislava.space/fullchain.pem -noout -enddate` на сервере.

## Проверка

`http://random-redirect-check-20261010.paulislava.space/test?x=1` и HTTPS-вариант возвращали `301` с нужным `Location`; TLS для HTTPS прошёл без отключения проверки сертификата. `https://careertime.paulislava.space/test?x=1` также вернул 301. `https://cms.paulislava.space/` продолжил отвечать собственным виртуальным хостом.

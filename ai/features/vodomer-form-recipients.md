# Почта получателя формы Водомер Урал

Дата: 2026-11-02.

В `api::vodomer-form.vodomer-form` добавлено необязательное поле `recipientEmail` типа email. Strapi проверяет формат адреса; сайт запрещает отправку, если адрес не заполнен. Это отдельная настройка каждой опубликованной формы, а не контактная почта страницы.

В Content Manager поле имеет подпись «Почта для заявок» и описание о необходимости публикации. Метаданные и расположение поля сохранены через сервис content-types плагина content-manager; они находятся в БД и сохраняются между деплоями. В опубликованных callback и detailed установлен адрес `metrologika16@mail.ru`. Перед публикацией проверено отсутствие других неопубликованных изменений и сохранён резерв draft/published и метаданных на VPS: `/root/vodomer-content-backups/recipients-20261102.json`.

Тест `node --test packages/cms/scripts/test-vodomer-form-recipient.cjs` использует настоящий валидатор Strapi: до изменения неверный email принимался (RED), после изменения отклоняется (GREEN); правильный адрес и null допустимы. Сборка CMS прошла. Коммит схемы: 8354045b. [CI/CD 41344125862](https://github.com/paulislava/paulislava.space/actions/runs/41344125862) завершился успешно после восстановления доступа к VPS. Публичный API проверен после публикации; обе формы возвращают настроенный recipientEmail.

## Файлы

- packages/cms/src/api/vodomer-form/content-types/vodomer-form/schema.json
- packages/cms/types/generated/contentTypes.d.ts
- packages/cms/scripts/test-vodomer-form-recipient.cjs

# Supabase и Telegram для Polina’s English Space

## 1. Создание таблиц

1. Откройте Supabase SQL Editor.
2. Выполните `schema.sql` целиком.
3. Выполните `verify.sql`.
4. Убедитесь, что основные проверки показывают `PASS`.

Схема создаёт шесть таблиц и не создаёт учебные материалы, Storage или пользователей.

## 2. Добавление реального Telegram-получателя

Получите настоящий `chat_id` преподавателя через Telegram-бота. Не сохраняйте его в GitHub.

В SQL Editor выполните, заменив число на реальное:

```sql
insert into public.telegram_recipients (
  student_id,
  chat_id,
  message_thread_id,
  enabled
)
values (
  'polina',
  123456789,
  null,
  true
)
on conflict (student_id) do update
set chat_id = excluded.chat_id,
    message_thread_id = excluded.message_thread_id,
    enabled = excluded.enabled;
```

Для темы в Telegram-группе укажите реальный `message_thread_id`; для обычного личного чата оставьте `null`.

## 3. Supabase Secrets

Установите через CLI или панель Supabase:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN="REAL_BOT_TOKEN"
supabase secrets set NOTIFY_WEBHOOK_SECRET="LONG_RANDOM_SECRET"
supabase secrets set ALLOWED_STUDENT_ID="polina"
supabase secrets set SITE_BASE_URL="https://USERNAME.github.io/REPOSITORY"
```

`SUPABASE_URL` и серверный ключ функции доступны в среде Supabase автоматически.

Не помещайте значения секретов в `config.js`, SQL, HTML или GitHub Variables.

## 4. Развёртывание Edge Function

Вручную:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-telegram
```

Или используйте `.github/workflows/setup-telegram.yml`.

Для workflow создайте GitHub Actions Secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

Файл `config.toml` содержит:

```toml
[functions.notify-telegram]
verify_jwt = false
```

Это необходимо, потому что сайт работает без авторизации. Сама функция разделяет публичные и защищённые действия.

## 5. Секреты GitHub для уведомлений о материалах

В репозитории откройте **Settings → Secrets and variables → Actions**.

Secrets:

```text
SUPABASE_PROJECT_ID
NOTIFY_WEBHOOK_SECRET
```

Variable:

```text
SITE_BASE_URL
```

`notify-new-materials.yml` вызывает функцию только при изменении опубликованного `lesson-N.json` или `grammar-N.json`.

`material_publications` имеет уникальность по ученику, типу, ID и версии уведомления, поэтому одинаковое сообщение не отправляется повторно. Для повторного уведомления после существенного изменения увеличьте в JSON:

```json
"notificationVersion": 2
```

## 6. Домашний отчёт

Браузер отправляет только:

```json
{
  "action": "homework_report",
  "studentId": "polina",
  "lessonId": "lesson-1",
  "submissionId": "UUID_FROM_DATABASE"
}
```

Баллы и ответы не принимаются из тела запроса. Функция заново читает зафиксированную строку из `homework_progress`, проверяет блокировку и формирует отчёт из серверных данных.

Если отчёт уже отправлен, повторный вызов возвращает `alreadySent: true` и не создаёт дубликат.

## 7. Ошибка отчёта

При ошибке Telegram:

- домашняя работа остаётся заблокированной;
- статус `report_status` становится `failed`;
- сохраняется безопасное описание ошибки;
- ученик видит кнопку повторной доставки.

Повторная доставка не создаёт вторую попытку и не разблокирует ответы.

## 8. Диагностическая страница

Откройте:

```text
telegram-report-test.html
```

Страница проверяет клиент Supabase, вызывает специальный режим функции и показывает:

- HTTP-статус;
- JSON-ответ;
- `functionVersion`;
- сравнение времени как объектов `Date`;
- понятное объяснение HTTP 401.

Диагностическое сообщение ограничено одной успешной отправкой в день. После настройки удалите страницу из публичного репозитория или оставьте ссылку неизвестной ученику.

## 9. Обновление функции

После изменения `supabase/functions/notify-telegram/index.ts` повторно запустите workflow **Deploy Supabase Telegram function** или команду deploy. Затем откройте диагностическую страницу и проверьте:

```text
functionVersion = homework-reports-v1
```

## 10. Ограничение схемы без авторизации

RLS ограничивает строки идентификатором `polina`, но не подтверждает личность человека. Не используйте эту архитектуру для экзамена, чувствительных данных или сайта с несколькими пользователями.

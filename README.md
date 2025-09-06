# Telegram WebApp Auth Starter (Next.js + TypeScript)

Готовый минимальный проект, который показывает корректную валидацию `initData` из Telegram WebApp на сервере.

## Что внутри

- **/src/pages/index.tsx** — фронтенд для Mini App: забирает `tg.initData` и отправляет на `/api/auth/verify-init-data`
- **/src/pages/api/auth/verify-init-data.ts** — серверная проверка подписи согласно официальной схеме
- **/src/lib/telegram.ts** — утилиты для валидации и CORS
- **/src/pages/login.tsx** — *опционально*: классический Login Widget (для браузера вне Telegram)
- **.env.local.example** — пример переменных окружения

## Быстрый старт

```bash
# 1) Склонируйте папку и установите зависимости
npm i

# 2) Создайте .env.local по образцу
cp .env.local.example .env.local
# отредактируйте BOT_TOKEN и при желании BOT_USERNAME и ALLOWED_ORIGINS

# 3) Запустите dev
npm run dev
```

Откройте бота в Telegram, отправьте пользователю `Start` с параметром `web_app` (через кнопку в меню бота), которая ведёт на ваш URL (`https://<host>/`).
Страница внутри Telegram вызовет проверку подписи и вернёт JSON с данными пользователя.

## Переменные окружения

- `BOT_TOKEN` — токен бота от BotFather (обязательно).
- `ALLOWED_ORIGINS` — список разрешённых Origin для CORS (через запятую). Для локальной разработки: `http://localhost:3000`.
- `BOT_USERNAME` — *только* для страницы `/login` (классический виджет). Для Mini App не требуется.

## Безопасность и нюансы

- Подпись считается как `HMAC_SHA256(data_check_string, secret_key)`, где `secret_key = SHA256(bot_token)`.
- `data_check_string` — это строки `key=value` из `initData` (кроме `hash`), отсортированные по ключу и склеенные символом `\n`.
- Рекомендуется проверять `auth_date` (в примере: не старше 24 часов).
- Нельзя доверять данным на клиенте — **всегда** валидируйте на сервере.
- Храните `BOT_TOKEN` только на серверной стороне.

## Подключение к боту (кнопка Web App)

В Telegram (через BotFather) добавьте в меню бота кнопку Web App, укажите URL вашего деплоя (например Vercel).
Когда пользователь откроет Mini App через эту кнопку, в `window.Telegram.WebApp` будет доступен `initData`.

## Деплой

- Vercel, Netlify, Render — любая среда, поддерживающая Next.js API Routes.
- Не забудьте добавить переменные окружения на проде.

Удачи! 🚀

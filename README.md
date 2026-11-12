# Дневник тренировок

Проект из трёх независимых частей:

| Папка | Что это | Технологии | Запуск | Адрес |
|---|---|---|---|---|
| `backend` | сервер API — общий для сайта и приложения | Python, Flask, PostgreSQL, Redis | `npm run redis`, потом `npm run dev` | http://localhost:3000 |
| `web` | сайт | HTML, CSS, JavaScript | `npm run dev` | http://localhost:8080 |
| `mobile` | мобильное приложение | React Native, Expo | `npm start` | Expo Go или http://localhost:8081 |

```
сайт (web)            ─┐
                       ├─ запросы /api/... (JSON) ─→  backend ─→ PostgreSQL (пользователи, тренировки)
приложение (mobile)   ─┘                                       └→ Redis (токены входа)
```

У каждой части свои библиотеки и настройки:
- `backend`: `requirements.txt`, `.env`, окружение Python `.venv`;
- `web`: библиотек нет, только `server.py` для раздачи файлов;
- `mobile`: `package.json`, `node_modules`.

Каждую часть запускают в своём терминале. Первым запускается `backend`, потому что `web` и `mobile` берут данные у него.
Подробности — в `README.md` каждой папки.

## Запуск в Docker

Бэкенд и сайт можно запустить в Docker одной командой (вместе с Redis). Нужен запущенный Docker Desktop
и PostgreSQL на компьютере (база в Docker не переносится):

```
cd backend
npm run docker        (то же самое: docker compose up -d --build)
```

| Контейнер | Что внутри | Адрес |
|---|---|---|
| `fit-diary-redis` | Redis 7 (токены входа) | порт 6379 |
| `fit-diary-backend` | Python 3.13 + бэкенд (`backend/Dockerfile`) | http://localhost:3000 |
| `fit-diary-web` | nginx + файлы сайта (`web/Dockerfile`) | http://localhost:8080 |

Остановить: `npm run docker:stop` (то же самое: `docker compose down`).
Пока бэкенд и сайт работают в Docker, запускать их через `npm run dev` не нужно — порты 3000 и 8080 будут заняты.

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

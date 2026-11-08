# Дневник тренировок — сайт

Обычные HTML, CSS и JavaScript, без библиотек. Данные сайт получает у бэкенда (папка `backend`, порт 3000).

## Как устроено

У каждого окна сайта есть страница, её JavaScript и адреса API на бэкенде.

| Окно | Страница | JS страницы | Бэкенд |
|---|---|---|---|
| Вход / регистрация | `login.html` | `js/login.js` | `backend/routes/login.py` |
| Главная (календарь, тренировки дня, ближайшие) | `index.html` | `js/home.js` | `backend/routes/home.py` |
| Конструктор (новая тренировка и изменение) | `create.html` | `js/create.js` | `backend/routes/create.py` |
| Тренировка | `workout.html` | `js/workout.js` | `backend/routes/workout.py` |
| Профиль | `profile.html` | `js/profile.js` | `backend/routes/profile.py` |

```
js/common.js    общие функции: запросы к бэкенду (api), меню, даты, календарь
css/            стили (style.css) и раскладка для компьютера (desktop.css)
server.py       простой сервер, который отдаёт файлы сайта браузеру (порт 8080)
```

Запросы к бэкенду отправляет функция `api` в `js/common.js` на адрес `http://<этот компьютер>:3000`.
Сайт и API на разных портах, поэтому в запросах стоит `credentials: "include"` — чтобы браузер отправлял cookie с токеном.

## Запуск

1. Запустите бэкенд (см. `backend/README.md`).
2. В этой папке:
   ```
   npm run dev
   ```
3. Откройте http://localhost:8080.

# Дневник тренировок — бэкенд

Python + Flask. Один сервер API для сайта (`web`) и мобильного приложения (`mobile`).
Данные (пользователи, тренировки) хранятся в PostgreSQL, токены входа — в Redis.

## Как устроено

```
app.py                  запуск сервера: подключает адреса /api/... из routes, разрешает запросы сайта и приложения (CORS)
db.py                   подключение к PostgreSQL и функции query / query_one / execute
auth.py                 вход: хеш пароля, чтение токена, «кто отправил запрос» (current_user)
tokens.py               токены входа в Redis: создать, проверить, удалить
routes/                 адреса API, по файлу на окно: login.py, home.py, create.py, workout.py, profile.py
database/schema.sql     таблицы: users, workouts, workout_exercises
database/create_tables.py   создаёт таблицы (npm run db:create)
database/seed.py        демо-аккаунт с тренировками (npm run db:seed)
Dockerfile              как собрать образ бэкенда для Docker (Python 3.13 + код)
docker-compose.yml      Redis, бэкенд и сайт в Docker (npm run docker) или только Redis (npm run redis)
requirements.txt        библиотеки Python: Flask, psycopg, argon2, python-dotenv, redis
.env                    адреса PostgreSQL и Redis, порт, разрешённые адреса сайта (создаётся из .env.example)
```

## Как устроен вход

1. Пароль хранится в PostgreSQL только в виде хеша (argon2).
2. При входе сервер создаёт токен — случайную строку — и записывает в Redis: `token:<токен> → id пользователя` на 30 дней.
3. Сайт получает токен в cookie (`httponly`), мобильное приложение — в ответе, и присылает его в заголовке `Authorization: Bearer <токен>`.
4. С каждым запросом сервер спрашивает у Redis, чей это токен, и берёт данные пользователя из PostgreSQL.
5. При выходе токен удаляется из Redis. Через 30 дней Redis удаляет его сам.

## Запуск

Нужны Python 3.11+, PostgreSQL, Docker Desktop (для Redis) и Node.js (только для команд `npm run`).

1. Один раз:
   ```
   npm run setup
   copy .env.example .env
   npm run db:create
   npm run db:seed
   ```
2. Каждый раз:
   ```
   npm run redis
   npm run dev
   ```
   API: http://localhost:3000. Демо-аккаунт: `ivanova@mail.ru` / `Fitness2026`.

## Запуск в Docker

```
npm run docker
```
Собирает образы по `Dockerfile` (бэкенд) и `../web/Dockerfile` (сайт) и запускает три контейнера: Redis, бэкенд, сайт.
Внутри контейнера `localhost` — это сам контейнер, поэтому в `docker-compose.yml` адреса заменены:
PostgreSQL — `host.docker.internal` (компьютер), Redis — `redis` (имя сервиса).
Остановить: `npm run docker:stop`.

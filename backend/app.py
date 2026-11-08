# Запуск сервера
import os

import redis
from flask import Flask, request

from routes import create, home, login, profile, workout

app = Flask(__name__)
app.json.ensure_ascii = False  

# Подключаем адреса API 
for module in (login, home, create, workout, profile):
    app.register_blueprint(module.bp)


# http://localhost:3000 — проверить, что сервер запущен
@app.get("/")
def index():
    return {"name": "Дневник тренировок — API", "status": "ok"}

@app.errorhandler(redis.ConnectionError)
def redis_is_down(error):
    return {"error": "Не запущен Redis"}, 503

ALLOWED_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:8080,http://localhost:8081").split(",")


@app.after_request
def allow_web_and_mobile(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"  
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE"
    return response


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, use_reloader=True)

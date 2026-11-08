# Вход и Регистрация
from flask import Blueprint, jsonify, request
from psycopg.errors import UniqueViolation

from auth import check_password, current_user, hash_password, login_response, public_user, read_token
from db import query_one
from tokens import delete_token

bp = Blueprint("login", __name__)


@bp.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}  
    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    
    errors = {}
    if not name:
        errors["name"] = "Введите имя"
    if "@" not in email:
        errors["email"] = "Некорректный адрес почты"
    if len(password) < 8:
        errors["password"] = "Пароль — не короче 8 символов"
    if errors:
        return {"error": "Проверьте поля", "fields": errors}, 400

    try:
        user = query_one(
            """INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)
               RETURNING id, name, email, created_at""",
            name, email, hash_password(password),
        )
    except UniqueViolation: 
        return {"error": "Почта уже занята", "fields": {"email": "Почта уже зарегистрирована"}}, 409
    return login_response(user, 201)


# Вход: проверяем почту и пароль
@bp.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    user = query_one(
        "SELECT id, name, email, created_at, password_hash FROM users WHERE email = %s", email
    )
    
    if not user or not check_password(password, user["password_hash"]):
        return {"error": "Неверная почта или пароль", "fields": {}}, 401
    return login_response(user, 200)


# Выход
@bp.post("/api/logout")
def logout():
    token = read_token()
    if token:
        delete_token(token)
    response = jsonify({"ok": True})
    response.delete_cookie("token")
    return response


# Кто вошёл 
@bp.get("/api/me")
def me():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    return public_user(user)

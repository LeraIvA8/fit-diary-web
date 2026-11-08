# Вход пользователя хеш пароля и токен входа.
#
# Как это работает:
# 1. При входе сервер создаёт токен — длинную случайную строку — и записывает его в Redis (tokens.py).
# 2. Сайт получает токен в cookie, мобильное приложение — в ответе (и хранит у себя).
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from flask import jsonify, request

from db import query_one
from tokens import TOKEN_DAYS, create_token, user_id_by_token

ph = PasswordHasher()  

def hash_password(password):
    return ph.hash(password)


def check_password(password, password_hash):
    try:
        return ph.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def read_token():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[len("Bearer "):]
    return request.cookies.get("token")


def current_user():
    token = read_token()
    if not token:
        return None
    user_id = user_id_by_token(token)  # спрашиваем Redis
    if not user_id:
        return None
    return query_one("SELECT id, name, email, created_at FROM users WHERE id = %s", user_id)


def public_user(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"], "createdAt": str(user["created_at"].date())}


def login_response(user, status):
    token = create_token(user["id"])

    response = jsonify({"user": public_user(user), "token": token})
    response.status_code = status
    # httponly — JavaScript на странице не прочитает cookie; samesite — cookie не уйдёт с чужих сайтов
    response.set_cookie("token", token, httponly=True, samesite="Lax", max_age=TOKEN_DAYS * 24 * 3600)
    return response

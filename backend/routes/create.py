# Конструктор
import math
from datetime import date

from flask import Blueprint, request

from auth import current_user
from db import connect

bp = Blueprint("create", __name__)#объединяем маршруты  которые относятся к созданию и редактированию тренировок в один модуль


# Проверяем поля формы
def check(data):
    errors = {}
    if not str(data.get("title") or "").strip():
        errors["title"] = "Введите название тренировки"
    try:
        date.fromisoformat(data.get("date"))  # "2026-11-16" — правильная дата
    except (TypeError, ValueError):
        errors["date"] = "Выберите день"

    exercises = data.get("exercises")
    if not exercises:
        errors["exercises"] = "Добавьте хотя бы одно упражнение"
        return errors
    for i, e in enumerate(exercises):
        if not str(e.get("name") or "").strip():
            errors[f"exercises.{i}.name"] = "Введите название упражнения"
        if not isinstance(e.get("sets"), int) or not 1 <= e["sets"] <= 20:
            errors[f"exercises.{i}.sets"] = "От 1 до 20"
        if not isinstance(e.get("reps"), int) or not 1 <= e["reps"] <= 100:
            errors[f"exercises.{i}.reps"] = "От 1 до 100"
    return errors

def estimate_minutes(exercises):
    seconds = sum(e["sets"] * (e["reps"] * 4 + 90) for e in exercises)
    return math.ceil((5 + seconds / 60) / 5) * 5


def insert_exercises(conn, workout_id, exercises):
    for e in exercises:
        conn.execute(
            "INSERT INTO workout_exercises (workout_id, name, sets, reps, note) VALUES (%s, %s, %s, %s, %s)",
            (workout_id, e["name"].strip(), e["sets"], e["reps"], str(e.get("note") or "").strip()),
        )


# Создание тренировки
@bp.post("/api/create")
def create():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    data = request.get_json(silent=True) or {}
    errors = check(data)
    if errors:
        return {"error": "Проверьте поля", "fields": errors}, 400


    with connect() as conn:
        workout = conn.execute(
            "INSERT INTO workouts (user_id, title, date, minutes) VALUES (%s, %s, %s, %s) RETURNING id",
            (user["id"], data["title"].strip(), data["date"], estimate_minutes(data["exercises"])),
        ).fetchone()
        insert_exercises(conn, workout["id"], data["exercises"])
    return {"id": workout["id"]}, 201 #у новой тренировки такой id


# редактирование трени
@bp.put("/api/create/<int:id>")
def update(id):
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    data = request.get_json(silent=True) or {}
    errors = check(data)
    if errors:
        return {"error": "Проверьте поля", "fields": errors}, 400

    with connect() as conn:
       
        updated = conn.execute(
            "UPDATE workouts SET title = %s, date = %s, minutes = %s WHERE id = %s AND user_id = %s RETURNING id",
            (data["title"].strip(), data["date"], estimate_minutes(data["exercises"]), id, user["id"]),
        ).fetchone()
        if not updated:
            return {"error": "Тренировка не найдена"}, 404
        conn.execute("DELETE FROM workout_exercises WHERE workout_id = %s", (id,))
        insert_exercises(conn, id, data["exercises"])
    return {"id": id}

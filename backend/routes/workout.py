# Тренировка»
from flask import Blueprint, request

from auth import current_user
from db import query, query_one

bp = Blueprint("workout", __name__)


# Тренировка с упражнениями
@bp.get("/api/workout/<int:id>")
def get_workout(id):
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    workout = query_one(
        "SELECT id, title, date::text AS date, minutes, completed FROM workouts WHERE id = %s AND user_id = %s",
        id, user["id"],
    )
    if not workout:
        return {"error": "Тренировка не найдена"}, 404
    workout["exercises"] = query(
        "SELECT name, sets, reps, note FROM workout_exercises WHERE workout_id = %s ORDER BY id", id
    )
    return workout


# Отметить Выполнено или нет
@bp.patch("/api/workout/<int:id>")
def set_completed(id):
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    completed = (request.get_json(silent=True) or {}).get("completed") is True
    updated = query_one(
        "UPDATE workouts SET completed = %s WHERE id = %s AND user_id = %s RETURNING id",
        completed, id, user["id"],
    )
    if not updated:
        return {"error": "Тренировка не найдена"}, 404
    return {"ok": True}


# Удалить тренировку 
@bp.delete("/api/workout/<int:id>")
def delete_workout(id):
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    deleted = query_one("DELETE FROM workouts WHERE id = %s AND user_id = %s RETURNING id", id, user["id"])
    if not deleted:
        return {"error": "Тренировка не найдена"}, 404
    return {"ok": True}

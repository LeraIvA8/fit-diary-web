#Главная
from flask import Blueprint, request

from auth import current_user
from db import query

bp = Blueprint("home", __name__)


# Дни, в которые есть тренировки: /api/home/calendar?from=2026-11-01&to=2026-11-30
@bp.get("/api/home/calendar")
def calendar():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    return query(
        """SELECT id, date::text AS date, completed
           FROM workouts
           WHERE user_id = %s AND date BETWEEN %s AND %s
           ORDER BY date""",
        user["id"], request.args.get("from"), request.args.get("to"),
    )


# Трени одного дня
@bp.get("/api/home/day")
def day():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    return query(
        """SELECT id, title, date::text AS date, minutes, completed,
                  (SELECT count(*) FROM workout_exercises e WHERE e.workout_id = workouts.id) AS exercises
           FROM workouts
           WHERE user_id = %s AND date = %s
           ORDER BY id""",
        user["id"], request.args.get("date"),
    )


# Ближайшие трени
@bp.get("/api/home/upcoming")
def upcoming():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    return query(
        """SELECT id, title, date::text AS date, minutes,
                  (SELECT count(*) FROM workout_exercises e WHERE e.workout_id = workouts.id) AS exercises
           FROM workouts
           WHERE user_id = %s AND NOT completed AND date >= %s
           ORDER BY date
           LIMIT 5""",
        user["id"], request.args.get("from"),
    )

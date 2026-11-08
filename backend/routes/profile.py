# Профиль
from flask import Blueprint

from auth import current_user, public_user
from db import query_one

bp = Blueprint("profile", __name__)


@bp.get("/api/profile")
def profile():
    user = current_user()
    if not user:
        return {"error": "Войдите в аккаунт"}, 401
    
    stats = query_one(
        """SELECT count(*)                                 AS workouts,
                  coalesce(sum(minutes), 0) / 60           AS hours,
                  count(DISTINCT date_trunc('week', date)) AS weeks
           FROM workouts WHERE user_id = %s AND completed""",
        user["id"],
    )
    return {"user": public_user(user), "stats": stats}

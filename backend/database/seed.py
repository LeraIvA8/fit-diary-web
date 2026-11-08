
from auth import hash_password
from db import connect

# Образцы тренировок: название, длительность в минутах, упражнения (название, подходы, повторения)
templates = [
    ("Кардио-интервалы", 30, [("Прыжки «звёздочка»", 4, 30), ("Бег на месте", 4, 40), ("Бёрпи", 3, 10), ("Скалолаз", 4, 30)]),
    ("Ноги и ягодицы", 70, [("Приседания со штангой", 5, 6), ("Румынская тяга", 4, 8), ("Выпады", 3, 12), ("Ягодичный мост", 4, 10), ("Жим ногами", 3, 12)]),
    ("Силовая — верх тела", 70, [("Жим штанги лёжа", 4, 8), ("Тяга штанги в наклоне", 4, 10), ("Жим гантелей сидя", 3, 10), ("Подтягивания", 4, 8)]),
    ("Кардио + пресс", 45, [("Скакалка", 4, 60), ("Планка", 3, 1), ("Скручивания", 3, 20), ("Подъём ног лёжа", 3, 15)]),
]

with connect() as conn:  
    conn.execute("DELETE FROM users WHERE email = 'ivanova@mail.ru'")
    user = conn.execute(
        """INSERT INTO users (name, email, password_hash, created_at)
           VALUES ('Валерия Иванова', 'ivanova@mail.ru', %s, now() - interval '50 days')
           RETURNING id""",
        (hash_password("Fitness2026"),),
    ).fetchone()

    # 2. Тренировки каждые 3 дня: 7 недель назад (выполнены) и месяц вперёд (запланированы)
    for n, day in enumerate(range(-49, 29, 3)):
        title, minutes, exercises = templates[n % len(templates)]
        workout = conn.execute(
            """INSERT INTO workouts (user_id, title, date, minutes, completed)
               VALUES (%s, %s, current_date + %s, %s, %s) RETURNING id""",
            (user["id"], title, day, minutes, day < 0),
        ).fetchone()
        for name, sets, reps in exercises:
            conn.execute(
                "INSERT INTO workout_exercises (workout_id, name, sets, reps) VALUES (%s, %s, %s, %s)",
                (workout["id"], name, sets, reps),
            )

print("Демо-аккаунт: ivanova@mail.ru / Fitness2026")

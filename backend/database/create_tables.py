
from pathlib import Path

from db import connect

schema = Path(__file__).parent / "schema.sql"

with connect() as conn:
    conn.execute(schema.read_text(encoding="utf-8"))

print("Таблицы созданы")

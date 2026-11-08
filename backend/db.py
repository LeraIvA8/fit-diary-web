# Подключение к базе 
import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()                              # загрузка данных из.env
DATABASE_URL = os.environ["DATABASE_URL"]  # подключение

def connect():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


# Все строки результата
def query(sql, *params):
    with connect() as conn:
        return conn.execute(sql, params).fetchall()


# Одна строка или None
def query_one(sql, *params):
    with connect() as conn:
        return conn.execute(sql, params).fetchone()


# Запрос без результата (UPDATE, DELETE)
def execute(sql, *params):
    with connect() as conn:
        conn.execute(sql, params)

# Образ бэкенда: Python + наш код. Сборка и запуск — docker compose (файл docker-compose.yml рядом)
FROM python:3.13-slim

WORKDIR /app
# не создавать __pycache__; печатать логи сразу, без задержки
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# Сначала только список библиотек: пока он не меняется, Docker берёт установленные библиотеки из кэша
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Потом код (файл .env сюда не копируется — настройки передаёт docker-compose.yml)
COPY *.py ./
COPY routes ./routes
COPY database ./database

EXPOSE 3000
CMD ["python", "-m", "flask", "--app", "app", "run", "--host", "0.0.0.0", "--port", "3000"]

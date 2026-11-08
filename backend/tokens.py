
import os
import secrets

import redis
from dotenv import load_dotenv

load_dotenv()
r = redis.Redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

TOKEN_DAYS = 30  


# Создать новый токен 
def create_token(user_id):
    token = secrets.token_urlsafe(32)  
    r.set(f"token:{token}", user_id, ex=TOKEN_DAYS * 24 * 3600)  
    return token


# Чей это токен
def user_id_by_token(token):
    user_id = r.get(f"token:{token}")
    return int(user_id) if user_id else None


# удалить токен
def delete_token(token):
    r.delete(f"token:{token}")

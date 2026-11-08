# Простой сервер для файлов сайта: python server.py → http://localhost:8080
# Он только отдаёт HTML, CSS и JS из этой папки. Данные сайт берёт у бэкенда (папка backend, порт 3000).
# Нужен только Python, никаких библиотек ставить не надо.
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # отдавать файлы из папки, где лежит server.py


class Handler(SimpleHTTPRequestHandler):
    # Тип каждого файла задаём сами: на Windows .js иногда записан в системе как text/plain,
    # и тогда браузер не запустит скрипт страницы
    extensions_map = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".ico": "image/x-icon",
    }

    # no-cache — браузер каждый раз спрашивает, не изменился ли файл.
    # Иначе после правок в CSS или JS он показывал бы старую копию, пока не нажмёшь Ctrl+F5
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


print(f"Сайт запущен: http://localhost:{PORT}")
ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()

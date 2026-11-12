# Образ сайта: веб-сервер nginx отдаёт HTML, CSS и JS из этой папки.
# Собирать ничего не нужно — сайт на обычном HTML и JavaScript, файлы копируются как есть
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY *.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

EXPOSE 80

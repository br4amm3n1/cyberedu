FROM nginx:1.24-alpine

COPY ./frontend/build /usr/share/nginx/html

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./nginx/ssl /etc/ssl
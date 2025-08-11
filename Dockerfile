FROM nginx:latest
# Копируем локальный билд (собранный в publish.sh) в директорию образа /usr/share/nginx/html
COPY build /usr/share/nginx/html
# Копируем конфиг nginx в директорию образа /etc/nginx/nginx.conf (Напишем его позже)
COPY nginx.conf /etc/nginx/nginx.conf
COPY build/nginx-csp-header.conf /etc/nginx/csp.conf
# COPY fullchain.pem /etc/nginx/certs/fullchain.pem
# COPY privkey.pem /etc/nginx/certs/privkey.pem

COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

COPY sendPackage.php /etc/nginx/certs/index.php

RUN apt-get update && apt-get install -y nodejs cron supervisor php php-cli php-fpm php-zip

ADD crontab /etc/crontab
RUN chmod 0600 /etc/crontab
RUN crontab /etc/crontab

COPY healthcheck.js /etc/healthcheck.js

COPY pushPackage.zip /usr/share/nginx/html/web.com.bit-flex

COPY www.conf /etc/php/7.4/fpm/pool.d/www.conf
RUN usermod -aG www-data nginx

EXPOSE 80

RUN usermod -u 1000 www-data


# RUN service php7.4-fpm start

CMD /usr/bin/supervisord
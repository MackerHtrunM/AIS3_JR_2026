FROM nginx:1.27-alpine

# reverse proxy 設定（取代預設 server block）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 靜態檔案
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/  /usr/share/nginx/html/js/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY . /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
EXPOSE 8080

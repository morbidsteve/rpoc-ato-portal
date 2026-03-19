FROM node:20-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont font-noto

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY server/package.json server/package-lock.json* ./
RUN npm ci --production 2>/dev/null || npm install --production
COPY server/src/ ./src/
COPY compliance/ /data/compliance/

USER node
EXPOSE 3000
ENV COMPLIANCE_DIR=/data/compliance/raise
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "src/index.js"]

FROM node:22-alpine

RUN apk add --no-cache tini

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

USER node
EXPOSE 8000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]

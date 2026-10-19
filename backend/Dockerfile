FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/users.db

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY src ./src

RUN mkdir /data && chown node:node /data
USER node 
EXPOSE 3000
CMD ["node", "src/index.js"]
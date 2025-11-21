FROM node:18-alpine
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x wait-for-db.sh
CMD ["./wait-for-db.sh", "db", "node", "index.js"]

# --- Step 1: Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# --- Step 2: Production Stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js .
COPY --from=build /app/package*.json ./

RUN npm ci --omit=dev

EXPOSE 8080

CMD [ "node", "server.js" ]
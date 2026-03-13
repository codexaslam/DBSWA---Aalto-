FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM denoland/deno:alpine-1.40.3
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "./dist/server/entry.mjs"]

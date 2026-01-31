# Build
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Runtime
FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "build"]


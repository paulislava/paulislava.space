FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev

FROM base AS build
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/.strapi ./.strapi
COPY package.json ./

EXPOSE 1337
CMD ["node", "dist/server.js"]

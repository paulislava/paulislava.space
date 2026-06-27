FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

FROM base AS deps
COPY package.json ./
RUN npm install

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/config ./config
COPY --from=build /app/public ./public
COPY --from=build /app/.strapi ./.strapi
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY package.json ./

EXPOSE 1337
CMD ["node_modules/.bin/strapi", "start"]

# ezPos backend API — build with TypeScript, run the compiled output.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Migration SQL must ship with the image for `npm run db:migrate` on deploy.
COPY drizzle ./drizzle
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]

# ezPos website — Next.js (App Router) with server-side pricing fetch.
FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=https://api.ezpos.com
ARG NEXT_PUBLIC_POS_URL=https://app.ezpos.com
ARG NEXT_PUBLIC_SITE_URL=https://ezpos.com
ARG API_BASE_URL=http://backend:3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_POS_URL=$NEXT_PUBLIC_POS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV API_BASE_URL=$API_BASE_URL
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3001
USER node
CMD ["npx", "next", "start", "-p", "3001"]

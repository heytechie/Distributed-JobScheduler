# Build the TypeScript application and generate the Prisma client.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Prisma generation reads the project configuration, which requires a URL.
# This placeholder is used only while building; the real DATABASE_URL is
# supplied by the deployment platform when the container starts.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate && npm run build


# Keep only the runtime dependencies and compiled application in the final image.
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated

USER node
EXPOSE 3000

# Override this command per service:
# API:    npm run start:api
# Worker: npm run start:worker
# Reaper: npm run start:reaper
CMD ["npm", "run", "start:api"]

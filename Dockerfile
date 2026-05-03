# syntax=docker/dockerfile:1

# Build
FROM node:24-alpine AS build

ARG DEBUG=false

WORKDIR /app

RUN corepack enable

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /pnpm/store to speed up subsequent builds.
# Leverage bind mounts to package.json and pnpm-lock.yaml to avoid copying them into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/pnpm/store \
    pnpm install

# Copy the rest of the source files into the image.
COPY . .

# Conditional debug build
RUN if [ "$DEBUG" = "true" ]; then pnpm run build:debug; else pnpm run build; fi

# Production
FROM node:24-alpine AS production

# Build provenance — passed through from `docker compose build` args (or
# left as "unknown" when not provided). Surfaces both as OCI image labels
# (visible via `docker inspect`) and as runtime ENV (the app reads these
# and logs them at startup so the running version is also visible in
# `docker logs` / debug.log).
ARG GIT_SHA=unknown
ARG GIT_BRANCH=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.revision="${GIT_SHA}"
LABEL org.opencontainers.image.ref.name="${GIT_BRANCH}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"

ENV NODE_ENV=production
ENV GIT_SHA=${GIT_SHA}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV BUILD_DATE=${BUILD_DATE}

WORKDIR /app

RUN corepack enable

COPY --from=build /app/dist ./dist

COPY package.json .

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /pnpm/store to speed up subsequent builds.
# Leverage bind mounts to package.json and pnpm-lock.yaml to avoid copying them into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/pnpm/store \
    pnpm install --prod

EXPOSE 3000

# Run the application.
CMD ["pnpm", "start"]

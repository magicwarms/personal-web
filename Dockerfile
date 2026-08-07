# syntax=docker/dockerfile:1

# Secrets never appear in this file. SMTP credentials are injected at run time by
# Dokploy; adding them as ARG/ENV would record them in the image metadata, where
# `docker history` exposes them permanently.

# Vite 8 and @vitejs/plugin-vue 6 both require node ^20.19.0 || >=22.12.0.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# `npm run build` runs vue-tsc and tsc, so this stage needs the full dependency
# tree, devDependencies included. None of it reaches the runtime image.
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# tini reaps zombies and forwards signals to a PID-1 Node process, so the
# SIGTERM handler in server/index.ts actually fires on `docker stop` and Traefik
# drains cleanly on redeploy instead of dropping live connections.
RUN apk add --no-cache tini

# package.json is needed at run time, not just as metadata: `"type": "module"`
# is what makes Node load the compiled dist-server/*.js files as ESM.
COPY --chown=node:node package.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/dist-server ./dist-server

# Drop root. The `node` user (uid 1000) ships with the official image.
USER node

EXPOSE 3000

# Node 22 has a global fetch, so this needs no curl or wget in the image.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]

# Deliberately not `npm start`: that script passes --env-file-if-exists=.env, and
# in a container all configuration must come from injected environment variables.
# npm as a parent process would also swallow signals.
CMD ["node", "dist-server/index.js"]

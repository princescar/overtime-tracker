FROM node:20-slim AS builder
RUN corepack enable
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/build /app/build
RUN echo '{ "type": "module" }' > /app/build/package.json
EXPOSE 3000
CMD ["node", "build"]

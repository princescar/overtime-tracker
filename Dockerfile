FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /app
RUN pnpm build
RUN echo '{ "type": "module" }' > /app/build/package.json

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/build /app/build
EXPOSE 3000
CMD ["node", "build"]

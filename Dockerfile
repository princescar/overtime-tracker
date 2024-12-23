FROM node:20-slim AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /app
RUN pnpm build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/build /app/build
RUN echo '{ "type": "module" }' > /app/build/package.json
EXPOSE 3000
CMD ["node", "build"]

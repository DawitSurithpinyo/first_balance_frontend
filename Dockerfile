FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable
RUN corepack prepare pnpm@10.20.0 --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM nginx:1.31.2-alpine
# Official Nginx image expects root user
COPY nginx/dev.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
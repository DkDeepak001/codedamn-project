FROM node:20

WORKDIR /app
RUN npm install -g pnpm@9.0.4

COPY . .
RUN pnpm install
RUN pnpm generate
RUN pnpm run build

WORKDIR /app/apps/web


EXPOSE 3000
CMD npm run start


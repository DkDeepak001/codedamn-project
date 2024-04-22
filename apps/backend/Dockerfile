FROM node:20

WORKDIR /ws

RUN apt-get update && \
  apt-get install -y awscli

COPY ./package.json ./
COPY ./tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001
EXPOSE 3002
EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]


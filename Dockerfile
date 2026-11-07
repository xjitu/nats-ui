FROM node:18.16.0 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod
FROM nginx:latest
COPY --from=builder /app/dist/nats-ui /usr/share/nginx/html
COPY runtime-config.sh /usr/share/nginx/html/runtime-config.sh
RUN chmod +x /usr/share/nginx/html/runtime-config.sh
CMD ["/usr/share/nginx/html/runtime-config.sh"]

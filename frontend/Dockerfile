FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# The API base URL comes from the committed frontend/.env.production, which Vite
# loads automatically during `npm run build`. To point at a different backend,
# edit frontend/.env.production and rebuild.
RUN npm run build

FROM nginx:alpine
# Copy the built app to nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html
# Setup routing for SPA
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html =404; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

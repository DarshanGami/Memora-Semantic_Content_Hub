# file: ./front end/memora-frontend/memora-frontend/Dockerfile

# Step 1: Build Vite frontend
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve via Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Uncomment this if you have a custom Nginx config for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

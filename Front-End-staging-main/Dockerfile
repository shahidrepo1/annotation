# ==========================
# Stage 1: Build with Node
# ==========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ==========================
# Stage 2: Nginx for serving
# ==========================
FROM nginx:alpine

# Copy build output to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# (Optional) Custom nginx.conf for SPA (React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

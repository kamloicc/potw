FROM nginx:alpine

COPY . /usr/share/nginx/html

# Use nginx-docker.conf for Docker Compose deployment
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

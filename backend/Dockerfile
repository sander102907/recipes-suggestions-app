# recipes subdomain frontend
FROM arm32v7/node:16-alpine as builder
ENV NODE_ENV production
# Create app directory
WORKDIR /backend

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

RUN npm ci

# Bundle app source
COPY ./ ./

RUN npm run build

# Bundle static assets with nginx
FROM nginx:latest-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /backend/build /usr/share/nginx/html
# Add your nginx.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]

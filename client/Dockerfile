# Use Node.js as the base image for building the app
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY ./package.json ./package-lock.json ./

# Install project dependencies
RUN npm install

# Copy all the source code to the container
COPY . .

# Build the React app using Vite
RUN npm run build

# Use Nginx as the base image to serve the built React app
FROM nginx:latest

# Copy the built React app from the builder stage to the Nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

# Use the official Node.js image
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the NestJS application files
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the build files from the first stage
COPY --from=build /app/dist ./dist

# Expose the NestJS default port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

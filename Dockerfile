FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the application
CMD ["node", "src/server.js"]
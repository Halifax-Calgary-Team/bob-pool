FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for hot-reloading
RUN npm install -g nodemon

# Copy source files
COPY . .

# Expose port
EXPOSE 3001

# Start with nodemon for hot-reloading
CMD ["nodemon", "server.js"]

# Made with Bob

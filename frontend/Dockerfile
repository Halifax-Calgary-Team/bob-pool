FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start Vite dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host"]

# Made with Bob

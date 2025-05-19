# Dockerfile
FROM node:18

# Create app directory
WORKDIR /app

# Copy server code
COPY server/ ./server/
COPY package*.json ./
COPY .env .env

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server/index.js"]

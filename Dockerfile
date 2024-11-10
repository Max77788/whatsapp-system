# Use an official Node.js runtime as a base image
FROM node:16-alpine

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and Chromium
RUN apk add --no-cache \
    chromium \
    harfbuzz \
    freetype \
    ttf-freefont

# Install npm dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose the necessary port (change 3000 if needed)
EXPOSE 5000

# Run the server script
CMD ["node", "./lib/whatsAppService/server.js"]
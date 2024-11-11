# Use an official Node.js runtime as a base image
FROM node:16-alpine

# Create and set working directory
WORKDIR /app

# Set environment variable to skip downloading Chromium for Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and Chromium
RUN apk add --no-cache \
    chromium \
    harfbuzz \
    freetype \
    ttf-freefont && \
    npm install --force

# Copy the rest of the application code
COPY . .

# Set Puppeteer executable path to use the system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose the necessary port (change 5000 if needed)
EXPOSE 5000

# Run the server script
CMD ["node", "./lib/whatsAppService/whatsAppClient.js"]
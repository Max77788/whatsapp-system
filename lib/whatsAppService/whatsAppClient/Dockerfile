# Use an official Node.js runtime as a base image
FROM node:16-alpine

# Create and set working directory
WORKDIR /app

# Set environment variable to skip downloading Chromium for Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install necessary system dependencies for Puppeteer and MongoDB
RUN apk add --no-cache \
    chromium \
    harfbuzz \
    freetype \
    ttf-freefont \
    git

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies required for MongoDB and Puppeteer compatibility
RUN npm install dotenv whatsapp-web.js wwebjs-mongo mongoose qrcode axios fs

# Copy the rest of the application code
COPY . .

# Set Puppeteer executable path to use the system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose the necessary port (change 5000 if needed)
EXPOSE 5000

# Run the server script
CMD ["node", "whatsAppClient.js"]

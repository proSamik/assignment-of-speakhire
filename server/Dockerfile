FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Run the build command
RUN npm run build

# Verify the build output 
RUN ls -la dist/ || echo "Build failed - dist directory not found"
RUN ls -la dist/index.js || echo "index.js not found in dist"

# Expose dynamic port (will use the PORT env var)
EXPOSE 5001

# Start the server
CMD ["node", "dist/index.js"] 
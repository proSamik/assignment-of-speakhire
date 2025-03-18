FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code without running seed during build
# We'll override the npm run build command to skip the seeding part
RUN npm run tsc || (echo "TypeScript compilation failed" && exit 1)

# Verify the build output 
RUN ls -la dist/ || echo "Build failed - dist directory not found"
RUN ls -la dist/index.js || echo "index.js not found in dist"

# Expose dynamic port (will use the PORT env var)
EXPOSE 5001

# Use npm start which includes the prestart hook that runs migrations and seed
# This ensures database operations happen when container starts, not during build
CMD ["npm", "start"] 
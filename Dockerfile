# Use official Node 20 image as the base
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json* ./

# Install only production dependencies (if any)
RUN npm install --omit=dev

# Serve the build with a simple static server
RUN npm install -g serve

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]

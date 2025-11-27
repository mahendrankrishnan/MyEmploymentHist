# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for migrations)
RUN npm install

# Copy source code
COPY src ./src
COPY drizzle.config.ts ./

# Generate migrations (if schema changes)
RUN npm run db:generate || echo "No migrations to generate or migrations already exist"

# Ensure drizzle directory exists (create empty if migrations weren't generated)
RUN mkdir -p ./drizzle && touch ./drizzle/.gitkeep

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install netcat for healthcheck
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for migrations with tsx)
RUN npm install

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy migrations from builder (generated during build stage)
# Directory is guaranteed to exist from builder stage
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 5005

# Start the application
CMD ["npm", "start"]


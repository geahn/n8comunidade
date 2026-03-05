# Stage 1: Build the frontend (Expo Web)
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npx expo export --platform web

# Stage 2: Setup the backend and serve the frontend
FROM node:20-alpine
WORKDIR /app

# Copy server files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/

# Copy the built frontend from stage 1
COPY --from=build-client /app/client/dist ./client/dist

# Environment variables
ENV PORT=3333
ENV NODE_ENV=production

EXPOSE 3333

# Start the monolith
CMD ["node", "server/index.js"]

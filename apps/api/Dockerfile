# Use the official Node.js 22 image as the base image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the root-level dependencies (bun.lockb, package.json, turbo.json)
COPY bun.lockb package.json turbo.json ./

# Copy package.json files for each workspace in your monorepo
COPY apps/api/package.json apps/api/
COPY apps/admin-panel/package.json apps/admin-panel/
COPY packages/db/package.json packages/db/
COPY packages/common/package.json packages/common/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
# Install Bun globally
RUN npm install -g bun@1.1.29

# Use Bun to install all dependencies
RUN bun install

# Copy the rest of the source code into the container
COPY . .

# Expose port 5001 for the API
EXPOSE 5001

#generate prisma client
RUN bun run db:generate
# Run the API build command from the root using Bun
RUN bun run build-api

# Start the API from the root using Bun
CMD ["bun", "run", "start-api"]


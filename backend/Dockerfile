# backend/Dockerfile

# 1. Use an official Node.js image. Alpine is small and secure.
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first.
# This leverages Docker's layer caching. If these files don't change,
# Docker won't re-run 'npm install' on subsequent builds, making them much faster.
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your application's source code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5000

# 7. The command to start the application when the container launches
CMD [ "npm", "start" ]
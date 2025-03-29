# Use the official Node.js image as a base
FROM node:16

# Set the working directory to /client (where your React app resides)
WORKDIR /client

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's files
COPY . .

# Build the React app
RUN npm run build

# Expose port for the app to be accessible
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]

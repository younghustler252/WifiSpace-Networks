# Use official Node.js 20 image
FROM node:20

# Install WireGuard and networking tools
RUN apt-get update && apt-get install -y wireguard iproute2 iputils-ping

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend
COPY . .

# Expose your backend port (adjust if needed)
EXPOSE 3000

# Bring up WireGuard and run Node.js
CMD ["bash", "-c", "wg-quick up /app/render_private.conf && node server.js"]

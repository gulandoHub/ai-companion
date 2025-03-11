FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port 3000
EXPOSE 3000

# Use the development server instead of building and serving
CMD ["npm", "start"] 
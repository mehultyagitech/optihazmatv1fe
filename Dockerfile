FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Increase Node heap size to 2GB for build
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host"]


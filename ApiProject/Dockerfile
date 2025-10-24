FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY app.js ./
COPY routes/ ./routes
COPY middleware/ ./middleware
COPY models/ ./models
COPY service/ ./service

EXPOSE 3001

CMD ["node", "app.js"]
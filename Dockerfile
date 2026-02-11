FROM node:23-alpine AS builder

WORKDIR /med_app

COPY package*.json ./
COPY tsconfig.json swagger.json ./

RUN ["npm", "install"]

COPY . .

RUN npm run build

EXPOSE 8088

CMD ["sh", "-c", "npm run migration && npm run start"]
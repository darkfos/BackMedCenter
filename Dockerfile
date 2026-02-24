FROM node:23-alpine AS builder

WORKDIR /med_app

COPY package*.json ./
COPY tsconfig.json swagger.json ./
RUN ["npm", "install"]

COPY . .
RUN npm run build

FROM node:23-alpine

WORKDIR /med_app

COPY package*.json ./
RUN ["npm", "install", "--omit=dev"]

COPY swagger.json ./
COPY --from=builder /med_app/dist ./dist

EXPOSE 8088

CMD ["sh", "-c", "npm run migration && npm run start"]

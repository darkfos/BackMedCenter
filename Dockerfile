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

RUN node -e "require('./dist/db/data-source.js')" || (echo "Missing dist/db/data-source.js" && ls -la dist/ 2>/dev/null; exit 1)

EXPOSE 8088

CMD ["sh", "-c", "npx typeorm migration:run -d /med_app/dist/db/data-source.js && node dist/index.js"]

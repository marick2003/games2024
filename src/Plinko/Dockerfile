# build stage
FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; else npm run build:development; fi

# production stage
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

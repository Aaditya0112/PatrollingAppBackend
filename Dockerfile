FROM node:20.11.0

WORKDIR /app

COPY package*.json .

COPY .gitignore .

COPY .env .

COPY ./src ./src

RUN npm install


EXPOSE 8080

CMD [ "node", "./src/index.js" ]

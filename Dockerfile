FROM node:10

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

#listen port:  process.env.PORT || 3000
ENV PORT 3000

CMD node index.js

EXPOSE 3000
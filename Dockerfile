FROM node:latest

MAINTAINER Rodrigo VDB "rodrigovdb@gmail.com"

ENV APP_PATH /var/app
RUN mkdir -p $APP_PATH

WORKDIR $APP_PATH

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT

CMD ["npm", "start"]

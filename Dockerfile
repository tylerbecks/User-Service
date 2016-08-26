FROM node:6.3.1
MAINTAINER UserService <christinejchou@gmail.com>

# Replace sh with bash so we can use source
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install project dependencies
RUN mkdir -p /usr/src/users
# RUN mkdir -p /usr/src/user-service
WORKDIR /usr/src/users

# Copy all files directory in host machine into location in container
COPY . /usr/src/users/

# Install Node and project dependencies
RUN npm install -gq nodemon \ 
  && npm install -qqq

# Expose port 80/81 (http) 
EXPOSE 81
# QueueRoom
Demo hosting on https://qr.winning-team.eu.org/
or https://queue.winning-team.eu.org/
or https://queue.yi-ting.live/
### What is this?
This is a full stack web application using Node.js, Express.js, SQLite, HTML, CSS, JavaScript, and Docker

Build to help people queue online. Users can create or join a room to queue online with a generated password. 

RESTful API is provided. Docker image is built for speeding the deployment process.

 
## Run
~~~ bash
# set up dependencies
npm install
# run Queue Room
npm start
# the server will now be listening on 8080 by default
~~~~

## Docker
[t41372/queue_room_docker](https://hub.docker.com/repository/docker/t41372/queue_room_docker)

### Build Docker Image from source code
~~~~ shell
docker buildx build \
    -t t41372/queue_room_docker:latest \
    --platform linux/amd64,linux/arm64 \
    --push \
    .

~~~~
### Run with Docker
~~~~ shell
docker run -d -p 8080:8080 t41372/queue_room_docker
#             -p (port you want it to listen on:8080)
#          -d if you want the server to run in the background
~~~~


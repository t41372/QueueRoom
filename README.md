# QueueRoom
### What is this?
This is a full stack web application using Node.js, Express.js, SQLite, HTML, CSS, JavaScript, and Docker

Build to help people queue online. Users can create or join a room to queue online with a generated password. 

RESTful API is provided. Docker image is built for speeding the deployment process.

 
## Run
~~~ bash
# set up dependencies
npm install
# run Queue Room
node server.js
# the server will now be listening on 8080 (default)
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

# Bug List

### In_room page does not have a particle background

Potential Causes:
>In short, this is because the browser can only get the html code we sent in `server.js app.get("in_room")`. Nothing else. Because particle.js background requires the particle.js file, the background won't work if the browser cannot access the particle.js file.

> This is because we are "sending" the html code within the server.js code and not serving it like a static website, all the other things - everything besides the html code itself, including the theme.css, particles.js, and app.js inside the /html/ folder, are not being sent to the browser when sending the html code in `server.js app.get("in_room")`.

Current Solution: ignore it. Make the background color the same black as other pages to make it less weird.

### Can't add people twice, or the server crash
~~who knows why...~~ Solved. (Dec 12, 2022) in server.js line 316, the `queryPromiseGet` function is mistakenly overriden, so after running `addPeople` function once, `queryPromiseGet` will not be a function anymore


# Bug List

### In_room page does not have a particle background

Potential Causes:
>In short, this is because the browser can only get the html code we sent in `server.js app.get("in_room")`. Nothing else. Because particle.js background requires the particle.js file, the background won't work if the browser cannot access the particle.js file.

> This is because we are "sending" the html code within the server.js code and not serving it like a static website, all the other things - everything besides the html code itself, including the theme.css, particles.js, and app.js inside the /html/ folder, are not being sent to the browser when sending the html code in `server.js app.get("in_room")`.

Current Solution: ignore it. Make the background color the same black as other pages to make it less weird.

### ~~Can't add people twice, or the server crash~~
~~who knows why...~~ Fixed. (Dec 12, 2022) in server.js line 316, the `queryPromiseGet` function is mistakenly overriden, so after running `addPeople` function once, `queryPromiseGet` will not be a function anymore


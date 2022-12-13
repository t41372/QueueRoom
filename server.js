const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
//const cookieParser = require('cookie-parser')

const port = process.env.PORT | 8080

let db = new sqlite3.Database("./database.db", (err) => {
    if(err)
    {
        console.log(err.message)
    }
})

app.use(express.static('html'))

app.get('/', (req, res) => {
    res.redirect('/welcome_page.html')
})

// need a query param password
app.get('/in_room', async(req, res) => {
    // /in_room/?password=1234
    let password = req.query.password;
    console.log("pswd is " + password)
    let people = (await getPeople(password))[0]
    if(!people)
    {
        console.log("User not exists")
        res.send("User not exists")
        return;
    }
    console.log(people)
    let roomNumber = people.RoomNumber;

    let html = `<!DOCTYPE html>

    <style>
        body{
            background-color: #1a1a1a;
        }
        
        h1{
            color: white
        }
        
        p{
            font-family:"Times New Roman", Times, serif;
            font-size: 30px;
        }
        
        #center-card{
            position: absolute;
            padding: 7%;
            padding-top: 4%;
            top: 20%;
            left: 30%;
            background-color: rgba(255, 255, 255, 0.471);
            border-radius: 10px;
        }
        #particles-js{
            width: 100%;
            height: 100%;
            background-color: #1a1a1a;
            background-image: url('');
            background-size: cover;
            background-position: 50% 50%;
            background-repeat: no-repeat;
        }
    </style>

    <head>
        <meta charset="utf-8">
        <title>Room ${roomNumber} </title>
        <link href= "./html/theme.css" type="text/css" rel="stylesheet">
    </head>
    
    
    <body>
    <!-- localhost/ in_room/-->
        <div id="particles-js">
            <div id="center-card">
                <p>ID: ${people.id}, password: ${people.password}, RoomNumber: ${people.RoomNumber}, queue: ${people.queue}</p>
                <button onclick="exitRoom()">Exit Room</button>
            </div>
        </div>
    </body>
    
    <script type="text/javascript">
        function exitRoom() {
            var url = "/deleteUser/";
            var params = "${password}";
            var http = new XMLHttpRequest();

            http.open("GET", url+params, true);
            http.onreadystatechange = function()
            {
                if(http.readyState == 4 && http.status == 200) {
                    alert(http.responseText);
                }
            }
            http.send("You have now left the room");
        }
    
    </script>
    <!-- Import Particles.js and app.js files -->
    <!-- Import Particles.js and app.js files -->
    <script src="./particles.js"></script>
    <script src="./app.js"></script>
    `;

    res.send(html)
})

// Create a new room
app.get('/addRoom/:roomName', (req, res) => {
    console.log("hello is " + req.query)
    console.log("room name is " + req.params.roomName)
    //addRoom(req.params.roomName)
    res.send("Successfully add room " + req.params.roomName)
})

// Create a new room
app.get('/addRoom/', (req, res) => {
    
    addRoom(req.query.room_name)
    res.send("Successfully add room " + req.query.room_name)
})

// :id is the room number to add people into
app.get('/addPeople/', async (req, res) => {
    // add people into the specific room
    
    // password is the return value - the password of the added people
    let password = await addPeople(req.query.roomNumber)
    if(password) //if added successfully
    {
        let people = (await getPeople(password))[0]
        // console.log(people)
        res.redirect("/in_room/?password=" + people.password)
    }
    else
    {
        res.send("Fail")
    }
})

// get data about a person
app.get('/getPeople/:password', async (req, res) => {
    res.redirect("/in_room/?password=" + req.query.password)
})

app.get('/getPeople/', async (req, res) => {
    res.redirect("/in_room/?password=" + req.query.password)
    
})

// :password is the password of the people to be deleted
app.get('/deleteUser/:password', (req, res) => {
    if(!deleteUser(req.params.password))
    {
        res.send("Fail")
    }
})


app.get('/getRoom/:roomNumber', async (req, res) => {
    console.log(await getTable(req.params.roomNumber))
    res.json(
        await getTable(req.params.roomNumber)
    )
})

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})



// 實現列表
// 1. 創建房間
// 2. 往房間里加人
// 3. 刪人, 把表重排 ()

// add room

// Run 獲取一堆數據,
// Param: insertQuery: the query
async function queryPromiseRun(insertQuery, values){
    return new Promise((resolve, reject) => {
        // 把query传给insertQuery， values用来赋值
        db.run(insertQuery, values, (err) => {
        if(err)
        {
            console.log(err.message);
        }
        resolve();
        })
    })
}

// get people's information
// return type: JavaScript Object {id, password, RoomNumber, queue}
async function getPeople(password){
    let getRoom = await queryPromiseAll(`SELECT * FROM Room WHERE password = ${password}`)
    return getRoom
}

// query the database db with input parameter "query" using ALL
// return undefined if the query target does not exists
async function queryPromiseAll(query)
{
    return new Promise( (resolve, reject) => {
        db.all(query, (err, data) => { //.all 用於獲取所有東西的特定fields
            if(err)                 //.get 可以獲取單一特定數據
            {
                console.log("Rejected 152")
                reject(err.message)
            }
            if(!data)
            {
                console.log("data is undefined")
                console.log(`err is ${err}, data is ${data}`)
            
            }
            resolve(data)
        })
    })
}

// query the database db with input parameter "query" using GET
// return undefined if the query target does not exists
async function queryPromiseGet(query)
{
    return new Promise( (resolve, reject) => {
        db.get(query, (err, data) => { //.all 用於獲取所有東西的特定fields
            if(err)                 //.get 可以獲取單一特定數據
            {
                
                console.log("data on error is " + data)
                console.log(err.message)
                reject(err.message)
            }
            if(!data)
            {
                console.log("data is undefined")
                console.log(`err is ${err}, data is ${data}`)
            
            }
            resolve(data)
        })
    })
}

//get all information from a room
async function getTable(roomNumber){
    let maxOfQueue = await queryPromiseGet(`SELECT MAX(queue) FROM Room WHERE RoomNumber = ${roomNumber}`)
    let nextQueueNumber = maxOfQueue["MAX(queue)"]
    return nextQueueNumber;
}


//add room
async function addRoom(roomName){
    let insertQuery = `INSERT INTO RoomList(RoomNumber,RoomName) values(?,?)`;
    let value = [null,roomName];
    await queryPromiseRun(insertQuery, value)
}

// Add people into the specific room and return its password (randomly generated)
// param: roomNumber: spcify the room number
// Return: password of the added people, False if fail (room not exists)
async function addPeople(roomNumber){
    // 1. check if the room exists in the room list
    let queryResult = await queryPromiseGet(`SELECT RoomNumber FROM RoomList WHERE RoomNumber = ${roomNumber}`)
    let getRoom = queryResult.RoomNumber
    
    // if query result exists, the room must exists
    if(!getRoom) // if the room not exists
    {
        console.log(`Room ${roomNumber} not exists, query result is ${queryResult}`)
        return false;
    }
    
    // 2. create a new password for the new people

    let newPassword = Math.floor(Math.random() * 100000) //generate a random 5 digit password

    while(true)
    {
        queryResult = await queryPromiseGet(`SELECT password FROM Room WHERE password = ${newPassword}`)
        if(!queryResult) // if the password not exists
        {
            break;
        }
        // if the password does exists, generate a new one
        newPassword = Math.floor(Math.random() * 100000) //generate a random 5 digit password
    }
    // we should have the password now...

    // 3. add people into the room with password and return the new password

    let maxOfQueue = await queryPromiseGet(`SELECT MAX(queue) FROM Room WHERE RoomNumber = ${roomNumber}`)
    let nextQueueNumber = maxOfQueue["MAX(queue)"] + 1
    console.log(nextQueueNumber)

    console.log(`next queue number is ${nextQueueNumber}`)

    if(!maxOfQueue) //if max of queue is null, means the room is empty
    {
        maxOfQueue = 0;
    }
    // 原始代碼:
    //     queryPromiseGet = await queryPromiseRun(`INSERT INTO Room(id, roomNumber, password, queue) VALUES(null, ${roomNumber}, ${newPassword}, ${nextQueueNumber})`)
    // queryPromiseGet函數調用兩次必炸的罪魁禍首: 在這316行把queryPromiseGet給覆蓋掉了. 這個插入邏輯本來是不需要存回傳值的...
    await queryPromiseRun(`INSERT INTO Room(id, roomNumber, password, queue) VALUES(null, ${roomNumber}, ${newPassword}, ${nextQueueNumber})`)
    console.log("Successfully add people into room " + roomNumber + ", password is " + newPassword)

    
    return newPassword

    // !-------INSERT INTO Room(id,password,RoomNumber,queue) values(1,2222,null,1);


}

// Delete person by using its password
// param: the password of the people to be deleted
//Return: False is return, if password doesn't exsist 
async function deleteUser(password){
    //1. check if the user exists
    let insertQuery = `SELECT password FROM Room WHERE password = ${password}`
    let getValue = await queryPromiseGet(insertQuery)
    //get password
    console.log("get value is")
    console.log(getValue)
    console.log("pswd is " + password)
    let getPassword = getValue.password;
    console.log("get password is " + getPassword)

    //get room nuumber by password
    let getRoomnumber = await queryPromiseGet(`SELECT RoomNumber FROM Room WHERE password = ${password}`)
    let roomNumber = getRoomnumber.RoomNumber

    //get queue
    let getQueue = await queryPromiseGet(`SELECT queue FROM Room WHERE password = ${password}`)
    // console.log(getPassword);
    let queueValue = getQueue.queue


    if(password != getPassword){
        console.log('Wrong!!!!!')
        return false;
        
    }else
    {
        //delete user by password
        let query = `DELETE FROM Room WHERE password = ${password}`
        await queryPromiseAll(query);

        //get max number of queue
        let maxOfQueue = await queryPromiseGet(`SELECT MAX(queue) FROM Room WHERE roomNumber = ${roomNumber}`)
        let nextQueueNumber = maxOfQueue["MAX(queue)"]

        //queue value is the queue of the deleted user
        //nextQueueNumber is the max queue of the room 
        
        //reset queue from Room
        for(i=0; i<nextQueueNumber - queueValue; i++){
            // console.log("i is " + i)
            // console.log(queueValue)
            // console.log(queueValue+i)
            // console.log(queueValue+i+1)
            let insertQuery = `UPDATE Room SET queue = ${queueValue+i} WHERE queue = ${queueValue+i+1} AND roomNumber = ${roomNumber}`
            await queryPromiseAll(insertQuery, null);
        }

        
    }

}

// deleteUser();
// handlebar 是一個template engine，可以讓我們在html裡面加入一些動態的內容
// 例如：{{}}，這個就是handlebar的語法，可以在裡面放入一些變數，或是function
// 這邊我們放入一個變數，變數的內容是從server.js傳過來的
// Mustache Template Engine

// redirect every unkown route to home page
app.get('*', (req, res)=>{
    res.redirect('/welcome_page.html')
})

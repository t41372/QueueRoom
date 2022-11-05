const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
//const cookieParser = require('cookie-parser')

const port = 8080

// use handlebars as the view engine: what process the dynamic html
// app.engine('handlebars', engine())
// app.set('view engine', "handlebars");
// app.set("views", "./views")

// app.use(express.static('static'));
// app.use(express.urlencoded( {extended: false}));
// app.use(cookieParser());

let db = new sqlite3.Database("./database.db", (err) => {
    if(err)
    {
        console.log(err.message)
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!')
    //res.render('home') 
    //render 會告訴view engine 這是獨立的一個頁面，不需要layout
})

// need a query param password
app.get('/in_room', async(req, res) => {
    // /in_room/?password=1234
    let password = req.query.password;
    let people = ((await getPeople(password))[0])
    let roomNumber = people.RoomNumber;

    let html = `<!DOCTYPE html>

    <head>
        <meta charset="utf-8">
        <title>Room ${roomNumber} </title>
    
    </head>
    
    <body>
    <!-- localhost/ in_room/-->
        <p>ID: ${people.id}, password: ${people.password}, RoomNumber: ${people.RoomNumber}, queue: ${people.queue}</p>
        <button onclick="exitRoom()">Exit Room</button>
    
    </body>
    
    <script type="text/javascript">
        function exitRoom() {
            var url = "deleteUser/";
            var params = "password=${password}";
            var http = new XMLHttpRequest();

            http.open("GET", url+params, true);
            http.onreadystatechange = function()
            {
                if(http.readyState == 4 && http.status == 200) {
                    alert(http.responseText);
                }
            }
            http.send(null);
        }
    
    </script>`;

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
        res.send(`Successfully add people into room ${req.query.roomNumber}, password is ${password}<br/>` +
        `ID: ${people.id}, password: ${people.password}, RoomNumber: ${people.RoomNumber}, queue: ${people.queue}`)
    }
    else
    {
        res.send("Fail")
    }
})

// get data about a person
app.get('/getPeople/:password', async (req, res) => {
    let people = (await getPeople(req.params.password))[0]
    res.send(`ID: ${people.id}, password: ${people.password}, RoomNumber: ${people.RoomNumber}, queue: ${people.queue}`)
})

app.get('/getPeople/', async (req, res) => {
    let people = (await getPeople(req.query.password))[0]
    res.send(`ID: ${people.id}, password: ${people.password}, RoomNumber: ${people.RoomNumber}, queue: ${people.queue}`)
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



// app.post("/get_actor", async (req, res) => {
//     const lastName = req.body.actor;
//     const db = await dbPromise;
//     let query = 'SELECT * FROM actor WHERE last_name = ?';
//     let result = await db.get(query, lastName);

//     if(result)
//     {
//         console.log(result)
//     } else {
//         console.log("No result found")
//     }

// })

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
    return new Promise((resolve, reject) =>{
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
            
            }
            resolve(data)
        })
    })
}

//
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
    let queryResult = await queryPromiseAll(`SELECT * FROM RoomList WHERE RoomNumber = ${roomNumber}`)
    
    // if query result exists, the room must exists
    if(!queryResult) // if the room not exists
    {
        console.log(`Room ${roomNumber} not exists, query result is ${queryResult}`)
        return false;
    }
    
    // 2. create a new password for the new people

    let newPassword = Math.floor(Math.random() * 100000) //generate a random 5 digit password

    while(true)
    {
        let queryResult = await queryPromiseGet(`SELECT password FROM Room WHERE password = ${newPassword}`)
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

    queryPromiseGet = await queryPromiseRun(`INSERT INTO Room(id, roomNumber, password, queue) VALUES(null, ${roomNumber}, ${newPassword}, ${nextQueueNumber})`)
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
        return false;
        
    }else
    {
        //delete user by password
        let query = `DELETE FROM Room WHERE password = ${password}`
        await queryPromiseAll(query);

        //get max number of queue
        let maxOfQueue = await queryPromiseGet(`SELECT MAX(queue) FROM Room WHERE roomNumber = ${roomNumber}`)
        let nextQueueNumber = maxOfQueue["MAX(queue)"] + 1

        //reset queue from Room
        for(i=0; i<nextQueueNumber - queueValue; i++){
            let insertQuery = `UPDATE Room SET queue = ${queueValue+i-1} WHERE queue = ${queueValue+i} AND roomNumber = ${roomNumber}`
            await queryPromiseAll(insertQuery, value);
        }
    }

}

// deleteUser();
// handlebar 是一個template engine，可以讓我們在html裡面加入一些動態的內容
// 例如：{{}}，這個就是handlebar的語法，可以在裡面放入一些變數，或是function
// 這邊我們放入一個變數，變數的內容是從server.js傳過來的
// Mustache Template Engine



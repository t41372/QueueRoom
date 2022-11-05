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

// Create a new room
app.get('/addRoom/:roomName', (req, res) => {
    console.log("room name is " + req.params.roomName)
    //addRoom(req.params.roomName)
    res.send("Successfully add room " + req.params.roomName)
})

// :id is the room number to add people into
app.get('/addPeople/:roomNumber', (req, res) => {
    // add people into the specific room
    
    // password is the return value - the password of the added people
    let password = addPeople(req.params.roomNumber)
    if(password) //if added successfully
    {
        res.send(`Successfully add people into room ${req.params.roomNumber}, password is ${password}`)
    }
    else
    {
        res.send("Fail")
    }
})

// :password is the password of the people to be deleted
app.delete('/deleteUser/:password', (req, res) => {
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

// query the database db with input parameter "query" using ALL
// return undefined if the query target does not exists
async function queryPromiseAll(query)
{
    return new Promise( (resolve, reject) => {
        db.all(query, (err, data) => { //.all 用於獲取所有東西的特定fields
            if(err)                 //.get 可以獲取單一特定數據
            {
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
    let queryResult = await queryPromiseGet(`SELECT * FROM RoomList WHERE RoomNumber = ${roomNumber}`)


    // if query result exists, the room must exists
    if(!queryResult) // if the room not exists
    {
        console.log(`Room ${roomNumber} not exists, query result is ${queryResult}`)
        return false;
    }
    
    // 2. create a new password for the new people

    let password = Math.floor(Math.random() * 100000) //generate a random 5 digit password

    while(true)
    {
        let queryResult = await queryPromiseGet(`SELECT * FROM Room WHERE password = ${password}`)
        
        if(!queryResult) // if the password not exists
        {
            break;
        }
        // if the password does exists, generate a new one
        password = Math.floor(Math.random() * 100000) //generate a random 5 digit password
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

    queryPromiseGet = await queryPromiseRun(`INSERT INTO Room(id, roomNumber, password, queue) VALUES(null, ${roomNumber}, ${password}, ${nextQueueNumber})`)
    console.log("Successfully add people into room " + roomNumber + ", password is " + password)

    
    return password

    // !-------INSERT INTO Room(id,password,RoomNumber,queue) values(1,2222,null,1);


}

// Delete person by using its password
// param: the password of the people to be deleted
//Return: False is return, if password doesn't exsist 
async function deleteUser(password){
    //1. check if the user exists
    let insertQuery = `SELECT password FROM Room WHERE password = 2222`
    let getValue = await queryPromiseGet(insertQuery)
    //get password
    let getPassword = getValue.password;

    //get room nuumber by password
    let getRoomnumber = await queryPromiseGet(`SELECT RoomNumber FROM Room WHERE password = 2222`)
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



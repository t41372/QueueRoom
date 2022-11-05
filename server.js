const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
//const cookieParser = require('cookie-parser')

const port = 8080

// use handlebars as the view engine: what process the dynamic html
app.engine('handlebars', engine())
app.set('view engine', "handlebars");
app.set("views", "./views")

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

    res.render('home') 
    //render 會告訴view engine 這是獨立的一個頁面，不需要layout
})

// Create a new room
app.post('/addRoom', (req, res) => {
    addRoom()
})

app.post('/addPeople/:id', (req, res) => {
    addPeople()

})

app.delete('/deleteUser/:id', (req, res) => {
    
})



app.post("/get_actor", async (req, res) => {
    const lastName = req.body.actor;
    const db = await dbPromise;
    let query = 'SELECT * FROM actor WHERE last_name = ?';
    let result = await db.get(query, lastName);

    if(result)
    {
        console.log(result)
    } else {
        console.log("No result found")
    }

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
async function queryPromiseRun(insertQuery){
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

// query the database db with input parameter "query" using GET
// return undefined if the query target does not exists
function queryPromiseGet(query)
{
    return new Promise( (resolve, reject) => {
        db.get(query, (err, data) => { //.all 用於獲取所有東西的特定fields
            if(err)                 //.get 可以獲取單一特定數據
            {
                reject(err.message)
            }
            resolve(data)
        })
    })
}

// Add people into the room
// param: roomNumber: spcify the room number
// Return: True if success, False if fail (room not exists)
async function addPeople(roomNumber){
    // 1. check if the room exists
    let queryResult = await queryPromiseGet(`SELECT * FROM room WHERE roomNumber = ${roomNumber}`)

    // if query result exists, the room must exists
    if(!queryResult) // if the room not exists
    {
        console.log(`Room ${roomNumber} not exists`)
        return false;
    }
    // 2. add people into the room


    

}

async function deleteUser(userId){
    //1. check if the user exists
    let insertQuery = `SELECT password FROM Room WHERE password = ${userId}`
    let getValue = await queryPromiseGet(insertQuery)
    if(getValue == null){
        return 404;
    }

}

// handlebar 是一個template engine，可以讓我們在html裡面加入一些動態的內容
// 例如：{{}}，這個就是handlebar的語法，可以在裡面放入一些變數，或是function
// 這邊我們放入一個變數，變數的內容是從server.js傳過來的
// Mustache Template Engine

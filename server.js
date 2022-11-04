const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
const cookieParser = require('cookie-parser')

const port = 8080

// use handlebars as the view engine: what process the dynamic html
// app.engine('handlebars', engine())
// app.set('view engine', "handlebars");
// app.set("views", "./views")

// app.use(express.static('static'));
// app.use(express.urlencoded( {extended: false}));
// app.use(cookieParser());

const dbPromise = sqlite.open({
    filename: './database/sakila.sqlite',
    driver: sqlite3.Database
})

app.get('/', (req, res) => {

    res.render('home') 
    //render 會告訴view engine 這是獨立的一個頁面，不需要layout
})
//rsgf

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


// handlebar 是一個template engine，可以讓我們在html裡面加入一些動態的內容
// 例如：{{}}，這個就是handlebar的語法，可以在裡面放入一些變數，或是function
// 這邊我們放入一個變數，變數的內容是從server.js傳過來的
// Mustache Template Engine
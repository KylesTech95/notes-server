require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { pool } = require("../db");
const PORT = !process.env.PORT ? 3023 : process.env.PORT;
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cookieSession = require('cookie-session')
const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');
const { Server } = require("socket.io");
const { createServer } = require('node:http');
const server = createServer(app);
const io = new Server(server);
let temp

// middleware
app.use(express.static(require('path').resolve(__dirname,'../public')))
app.set("view engine", "ejs");
app.set('views',require('path').resolve(__dirname,'../public'))
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true, // Set to false if you want to only save sessions when data is stored
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
io.engine.use(session);
// connect routes.js
// routes(app,pool)
// get homepage

app.route('/').get(async(req,res)=>{
  console.log(req.session.id)
  // generate random id
  try{
    // check to see if id is already in db
    let checkId = await pool.query('select * from users where id = $1',[!req.session.id ? (uuidv4()) : req.session.id])
    if(checkId.rowCount<1){
      console.log('fired here!')
        req.session.id = (uuidv4())
        await pool.query('insert into users(id) values($1)',[req.session.id])
        await pool.query('update notepad set user_id = $1 where user_id = $2',[req.session.id,temp])
        temp = null;
    }
    else {
      console.log('same user in session')
    }
    res.render('index.ejs')

  }
  catch(err){
    throw new Error(err)
  }
})
app.route("/notes").post(async (req, res) => {
  // identify notes
  const notes = req.body.notes;
  // insert new note into db
  try {
    if (notes) {
      await pool.query("insert into notepad(notes,user_id) values($1,$2)", [notes,req.session.id]);
      const getFields = await pool.query("select * from notepad where user_id = $1",[req.session.id]);
      const rows = getFields.rows;
      // send notes via json
      res.json({
        data: rows.map((row) => {
          return { id: row.id, notes: row.notes, timestamp: row.timestamp };
        }),
      });
    } else {
      console.log("you entered nothing");
    }
  } catch (err) {
    console.log(err);
  }
});

let timeout,interval, ctr=0;
app.post('/browser-close',(req,res)=>{
  try{
    if(req.session.id != null){
      timeout = setTimeout(async()=>{
        await pool.query('delete from users where id = $1;',[req.session.id])
        temp = req.session.id
        req.session.destroy();
      },20000)
      interval = setInterval(()=>{
        ctr+=1
        console.log(ctr)
        if(ctr >= 20){
          clearInterval(interval)
        }
      },1000)
      const {data} = req.body
      // console.log(data)
      // console.log(req.session.id)
      
      res.json(req.body)
    }
  }
  catch(err){
    throw new Error(err)
  }
  
})
app.post('/browser-open',(req,res)=>{
  try{
 if(req.session.id!=null){
  ctr = 0;
  clearTimeout(timeout)
  clearInterval(interval)
  const {data} = req.body
  // console.log(data)
  // console.log(req.session.id)
  
  res.json(req.body)
 }
  }
  catch(err){
    throw new Error(err)
  }
})

app.get("/notes", async (req, res) => {
  // alternate ending
  // get all fields
  const getFields = await pool.query("select * from notepad where user_id = $1",[req.session.id]);
  const rows = getFields.rows;
  // send notes via json
  res.json({
    data: rows.map((row) => {
      return { id: row.id, notes: row.notes, timestamp: row.timestamp };
    }),
  });
});

app.route("/delete").post(async (req, res) => {

  try {
    await pool.query(
      "truncate notepad;"
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});
app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      alert("database is empty");
      red.redirect("/");
    } else {
      await pool.query("delete from notepad where id=$1", [id]);
      console.log("you deleted an item");
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
});

// app.listen(PORT, () => {
//   console.log("You are listening on port: " + PORT);
// });
server.listen(PORT, () => {
  console.log("You are listening on port: " + PORT);
});
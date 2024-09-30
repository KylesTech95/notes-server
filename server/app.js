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
const Keygrip = require('keygrip');
const matchUserId = (array,id) => {
  return [...array].find(x=>x.id==id)
}

// middleware
app.use(express.static(require('path').resolve(__dirname,'../public')))
app.set("view engine", "ejs");
app.set('views',require('path').resolve(__dirname,'../public'))
app.use(
  cookieSession({
      name:'session',
      keys:['nfdaqh90','324ff_$tff'],
      keys: new Keygrip(['key1', 'key2'], 'SHA384', 'base64'),
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
      store: new MemoryStore({
        checkPeriod: 1800000,
      }),
  })
);
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// get homepage
app.route('/').get(async(req,res)=>{
  console.log(req.session.id)
  // generate random id
  try{
    // check to see if id is already in db
    let checkId = await pool.query('select * from users where id = $1',[!req.session.id ? (uuidv4()) : req.session.id])
    let checkPrev = await pool.query('select previd from users where previd = $1',[req.session.id])
    console.log(checkPrev.rows)
    // if false, 
    if(checkId.rowCount<1){
      console.log('fired here!')
        req.session.id = (uuidv4())
        // if previd char exists, update null userid to the new id
        if(checkPrev.rows[0] != undefined){
          // update new user id according to the previd
          await pool.query('update users set id = $1 where previd = $2',[req.session.id,checkPrev.rows[0].previd])
          // update notepad to the new user id based on the previous id
          await pool.query('update notepad set user_id = $1 where user_id = $2',[req.session.id,checkPrev.rows[0].previd])
        // update previd column (users table)
        await pool.query('update users set previd = $1 where id = $1',[req.session.id])
        }
        else {
        // insert new row for current user
        await pool.query('insert into users(id,previd) values($1,$1)',[req.session.id])
        }
        
    }
    else {
      // user is in the same session
      console.log('same user in session')
    }
    res.render('index.ejs')

  }
  catch(err){
    throw new Error(err)
  }
})
// post notes
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

let timeout,timeout2
app.post('/browser-close',async (req,res) => {
  
  req.session.ctr = 0;
  let allUsers = await pool.query('select * from users');
  let userArr = allUsers.rows;
  try{
    let tempting
    if(req.session != null && matchUserId(userArr,req.session.id)!=undefined){
      tempting = req.session.id;

      timeout = setTimeout(async()=>{
        let checkPrev = await pool.query('select previd from users where previd = $1',[req.session.id])
        console.log(checkPrev.rows[0])
        console.log(checkPrev.rows[0].previd)
        await pool.query('update users set id = null where id = $1',[req.session.id])
        // req.session.destroy(); // express session destroyed
        req.session = null; // cookie session destroyed
        console.log(req.session)
        timeout2 = setTimeout(async()=>{
          await pool.query('delete from users where id is null;')
          await pool.query('delete from notepad where user_id = $1',[tempting])
          tempting = null;
      },30000)
      },30000)
    }
    res.json(req.body)
  }
  catch(err){
    throw new Error(err)
  }
  
})
app.post('/browser-open',(req,res)=>{
  try{
    console.log(req.session)
 if(req.session != null){
  console.log('SESSION STILL GOIGN')
  req.session.ctr = 0;
  clearTimeout(timeout)
  clearTimeout(timeout2)
 }
 res.json(req.body)
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
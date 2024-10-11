require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { pool } = require("../db");
const PORT = !process.env.PORT ? 3023 : process.env.PORT;
const cookieSession = require('cookie-session')
const {
  createCipheriv,
  randomBytes,
} = require("crypto");

// middleware
app.use(express.static(require('path').resolve(__dirname,'../public')))
app.set("view engine", "ejs");
app.set('views',require('path').resolve(__dirname,'../public'))
app.use(
  cookieSession({
    name: "session",
    maxAge: 120000,
    secret: "dont use this secret example",
    priority: "medium",
    secure: false,
    httpOnly: false,
  })
);
app.use(encryptUsers)
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// get homepage
app.route('/').get(async(req,res)=>{
  console.log(req.session.id)
  res.render("index.ejs");
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
      "delete from notepad where user_id=$1",[req.session.id]
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



// encrypt users
async function encryptUsers(req, res, next) {
    let newdate = new Date();
      let date = newdate.getTime().toString();
      // encrypt the date with a cipher
      let key = randomBytes(32);
      let salt = randomBytes(16);    
  try{
    let newId = createId(date,key,salt)
    // check to see if id is already in db
    let userFound = await pool.query('select * from users where id = $1',[req.session.id])
    // collect id(s) found
    let found = userFound.rows
    console.log(found)
    if(found.length < 1){
        console.log('no users found')
        req.session.id = newId
        await pool.query('insert into users(id) values($1); ',[req.session.id])
    }
    else{
      console.log('user found!')
    }

    
    next();
  }
  
  catch(err){
    throw new Error(err)
  }
}
// create id
function createId(id, key, salt){
  const cipher = createCipheriv("aes-256-gcm", key, salt);
  const encryptId = cipher.update(id, "utf-8", "hex") + cipher.final("hex");
  return encryptId;
}; 
app.listen(PORT, () => {
  console.log("You are listening on port: " + PORT);
});
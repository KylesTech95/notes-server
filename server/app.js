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
  createDecipheriv,
  createHash,
} = require("crypto");

// middleware
app.use(express.static(require('path').resolve(__dirname,'../public')))
app.set("view engine", "ejs");
app.set('views',require('path').resolve(__dirname,'../public'))
app.use(
  cookieSession({
    name: "session",
    maxAge: 1800000,
    secret: process.env.SECRET,
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
      // encrypt notes
      const encnotesObj = encrypt(notes)
      await pool.query("insert into notepad(notes,user_id) values($1,$2)", [encnotesObj,req.session.id]);
      const getFields = await pool.query("select * from notepad where user_id = $1",[req.session.id]);
      const rows = getFields.rows;
      // send notes via json
      res.json({
        data: rows.map((row) => {
          const decnotes = (row['notes'])
          const encrypted = decnotes['note'];
          const iv = decnotes['iv']
          const decrypted = decrypt(encrypted,iv,'aes-256-gcm')
          return { id: row.id, notes: decrypted, timestamp: row.timestamp };
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

      const decnotes = (row['notes'])
      const encrypted = decnotes['note'];
      const iv = decnotes['iv']
      const decrypted = decrypt(encrypted,iv,'aes-256-gcm')
      return { id: row.id, notes: decrypted, timestamp: row.timestamp };
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
      // console.log("you deleted an item");
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
    // console.log(found)
    if(found.length < 1){
        // console.log('no users found')
        req.session.id = newId
        await pool.query('insert into users(id) values($1); ',[req.session.id])
    }
    else{
      // console.log('user found!')
    }

    
    next();
  }
  
  catch(err){
    throw new Error(err)
  }
}
// create id
function createId(id){
  // const cipher = createCipheriv("aes-256-gcm", key, salt);
  // const encryptId = cipher.update(id, "utf-8", "hex") + cipher.final("hex");
  // return encryptId;
  const hash = createHash('sha1').update(id).digest('hex')
  // console.log('hash')

  return hash
}; 
// encrypt notes
function encrypt(notes){
  // console.log('encrypt')
  // start symmetric encryption
  const alg = 'aes-256-gcm'
  const key = Buffer.alloc(32,process.env.KEY);
  // console.log(key)
  const iv = randomBytes(16)
  // console.log('iv original')
  // console.log(iv)
  // console.log('iv hex')
  // console.log(iv.toString('hex'))
  const cipher = createCipheriv(alg,key,iv);
  const encryptedNote = cipher.update(notes, "utf-8", "hex") + cipher.final("hex");
  return JSON.stringify({note:encryptedNote,iv:iv.toString('hex')})
}
function decrypt(encrypted,iv,alg){
  // console.log('decrypt')
  // start symmetric encryption
  const key = Buffer.alloc(32,process.env.KEY);
  // console.log('key')
  // console.log(key)
  // console.log('almost iv')
  // console.log(iv)
  iv = Buffer.from(iv,'hex')
  // console.log('iv')
  // console.log(iv)
  const decipher = createDecipheriv(alg,key,iv);
  const decryptedNote = Buffer.from(
    decipher.update(Buffer.from(encrypted, "hex"), "utf-8"))  
    return decryptedNote.toString()
}

const server = app.listen(PORT, () => {
  console.log("You are listening on port: " + PORT);
});

// truncate tables & sequence in db when serveris closed
server.on('close',async ()=>{
  console.log('server closed')
})
// graceful shutdown
process.on('SIGINT',()=>{
  server.close(async()=>{
    const query = 'truncate users,notepad cascade;alter sequence notepad_id_seq restart with 1;'
    await pool.query(query)
    process.exit(0)
  })
})



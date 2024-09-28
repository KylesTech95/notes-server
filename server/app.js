require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const { pool } = require("../db");
const PORT = !process.env.PORT ? 3023 : process.env.PORT;
const passport = require('passport')
const eSession = require('express-session')
// middleware
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(eSession({
  secret:process.env.SECRETY,
  resave:false,
  saveUninitialized:true,
  cookie:{secure:true,maxAge:86400000}
}))
// connect routes.js
// routes(app,pool)
// get homepage
app.route("/").get((req, res) => {
  try {
    console.log("request succeeded");
  } catch (err) {
    throw new Error(err);
  }
});

app.route("/notes").post(async (req, res) => {
  // identify notes
  const notes = req.body.notes;
  // insert new note into db
  try {
    if (notes) {
      await pool.query("insert into notepad(notes) values($1)", [notes]);
      const getFields = await pool.query("select * from notepad");
      const rows = getFields.rows;
      console.log(rows);
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
  const getFields = await pool.query("select * from notepad");
  const rows = getFields.rows;
  console.log(rows);
  // send notes via json
  res.json({
    data: rows.map((row) => {
      return { id: row.id, notes: row.notes, timestamp: row.timestamp };
    }),
  });
});

app.route("/delete").post(async (req, res) => {
  const notes = req.body.notes;

  try {
    await pool.query(
      "truncate notepad;alter sequence notepad_id_seq restart with 1"
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
      console.log(id);
      await pool.query("delete from notepad where id=$1", [id]);
      console.log("you deleted an item");
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log("You are listening on port: " + PORT);
});

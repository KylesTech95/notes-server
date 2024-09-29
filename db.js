require('dotenv').config()
const { Pool } = require('pg')
const { Sequelize } = require('sequelize')

    // const sequalize = new Sequelize(process.env.URI,
    //     {dialect:"sqlite",
    //      storage:"./database.sqlite",
    //      logging:false,
    //     })
    //     sequalize.sync().then(()=>{
    //         console.log('you are connected to pg')
    //     }).catch(err=>console.log(err))
const pool = new Pool({
    user: process.env.DBU,
    database: process.env.DB,
    password: process.env.PD,
    port: process.env.DBP,
    host:process.env.DBH,
    // ssl:{
    //     rejectUnauthorized:false,
    // }
})

// console.log(pool)

module.exports = { pool };
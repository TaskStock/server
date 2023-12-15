// 현재 local mysql db로 진행중

require('dotenv').config();

// get the client
const mysql = require('mysql2/promise');

// create the connection to database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = db;
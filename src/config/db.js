// 현재 local mysql db로 진행중

require('dotenv').config();

const pg = require("pg");

const db = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: process.env.DB_POOL_NUM,
});

module.exports = db;
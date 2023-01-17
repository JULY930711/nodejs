const mysql = require('mysql2');
 const pool = mysql.createPool({
  host:'localhost',
  user:'root',
  password:'admin0711',
  database:'proj-57',
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0
 })

 module.exports=pool.promise();
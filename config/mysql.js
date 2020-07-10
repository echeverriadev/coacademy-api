var mysql = require("mysql");
require("./enviroments");

var pool = mysql.createPool({
  connectionLimit: 100, //important
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  debug: false,
});

pool.getConnection(function (err, connection) {
  if (err) {
    console.log("Error in connection database");
    return;
  }

  console.log("connected as id " + connection.threadId);

  connection.on("error", function (err) {
    console.log("Error in connection database");
    return;
  });
});

module.exports = () => {
  return pool;
};

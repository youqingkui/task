/**
 * Created by youqingkui on 14-9-15.
 */
var mysql = require('mysql');

function mysqldb(){
  this.host = process.env.MYSQL_HOST;
  this.user = process.env.MYSQL_NAME;
  this.password = process.env.MYSQL_PASSWORD;
  this.database = process.env.DATABASE;

  this.db;

  this.create = create;
}

function create(){
  this.db = mysql.createConnection({
    host: this.host,
    user: this.user,
    password: this.password,
    database: this.database
  });

  this.db.connect(function(err){
    if(err){
      console.log('error when connecting to db:', err);
      setTimeout(handleError, 2000);
    }
  });

  this.db.on('error', function(error){
    console.log('db error', error);
    if(error.code === 'PROTOCOL_CONNECTION_LOST'){
      this.create();
    }
    else{
      throw error;
    }
  });
}

module.exports = mysqldb;
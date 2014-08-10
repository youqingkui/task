var schedule = require("node-schedule");
var request = require("request");
var mysql = require('mysql');
var getTime = require('./remOrder').getLocalTime;
var address = process.env.MYKAR_EMAIL


/*链接mysql*/
var db;
function handleError() {
  db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DATABASE
  });

  db.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleError, 2000);
    }

  });

  db.on('error', function (error) {
    console.log('db error', error);

    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      handleError();
    } else {
      throw error;
    }
  });

  

}
handleError();



/*邮件样式*/
var tableStyle = ' class="table table-striped" style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;border-spacing: 0;border-collapse: collapse!important;background-color: transparent;width: 100%;max-width: 100%;margin-bottom: 20px;"';
var thStyle = ' style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 0;text-align: left;background-color: #fff!important;"';
var trStyle = ' style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;page-break-inside: avoid;"';
var tdStyle = ' style="-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;padding: 0;background-color: #fff!important;"';



exports.TimeServe = function () {
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(1, 6)];
  rule.hour = 9;
  rule.minute = 0;
  console.log('wait');
  var j = schedule.scheduleJob(rule, function () {
    doSeller();
    doUser();
  });

}

function doSeller() {
  var currTime = Date.parse(new Date()) / 1000;
  var currMonth = new Date(parseInt(currTime) * 1000).getMonth() + 1;
  var currDay = new Date(parseInt(currTime) * 1000).getDate();
  var currYear = new Date(parseInt(currTime) * 1000).getFullYear();
  var lastDay = currDay - 1;
  var lastMonth = currMonth;
  var lastYear = currYear;
  if (lastDay <= 0) {
    lastDay = 1;
    lastMonth = lastMonth - 1;
  }
  if (lastMonth <= 0) {
    lastMonth = 1;
    lastYear = currYear - 1;
  }
  var date = lastMonth + '/' + lastDay + '/' + lastYear; //月日年
  console.log(date);
  var utcLastDate = Date.parse(date) / 1000;

  db.query(
    "SELECT * FROM seller WHERE regtime >? AND regtime <?",
    [utcLastDate, currTime], 
    function (err, seller) {
      if (err) {
        return console.log(err);
      }
      console.log('seller');
      var countSeller = seller.length;
      var content = "<h1>从昨天上午9点到今天上午9点暂未添加商户,可能是管理员疏忽或太忙,sorry.</h1>";
      if(seller.length){
        content = sendSellerHTML(seller);
      }
      var subject = '新增加的商户';
      var url = 'http://localhost:3000/send';
      request.post(url, {
        form: {
          'subject': subject,
          'content': content,
          'address': address
        }
      }, function (err, res, body) {
        if (err) {
          return console.log(err);
        }
        console.log(body);

      });

    }
  );

}

function doUser() {
  var currTime = Date.parse(new Date()) / 1000;
  var currMonth = new Date(parseInt(currTime) * 1000).getMonth() + 1;
  var currDay = new Date(parseInt(currTime) * 1000).getDate();
  var currYear = new Date(parseInt(currTime) * 1000).getFullYear();
  var lastDay = currDay - 1;
  var lastMonth = currMonth;
  var lastYear = currYear;
  if (lastDay <= 0) {
    lastDay = 1;
    lastMonth = lastMonth - 1;
  }
  if (lastMonth <= 0) {
    lastMonth = 1;
    lastYear = currYear - 1;
  }
  var date = lastMonth + '/' + lastDay + '/' + lastYear; //月日年
  console.log(date);
  var utcLastDate = Date.parse(date) / 1000;
  db.query(
    "SELECT * FROM user WHERE regtime >? AND regtime <?", 
    [utcLastDate, currTime],
    function (err, user) {
      if (err) {
        return console.log(err);
      }
      //console.log(user);
      var countUser = user.length;
      var subject = '新增加的用户';
      var content = '从昨天上午9点到今天上午9点暂时未发现注册用户';
      if(user.length){
        content = sendUserHTML(user);
      }
      var url = 'http://localhost:3000/send';
      request.post(url, {
        form: {
          'subject': subject,
          'content': content,
          'address': address
        }
      }, function (err, res, body) {
        if (err) {
          return console.log(err);
        }
        console.log(body);

      });

    }
  );



}


function sendUserHTML(user){
  var html = '<table ' + tableStyle + '>' +
    '<th ' + thStyle + '>' + 'uid' + '</th>' +
    '<th ' + thStyle + '>' + 'mobile' + '</th>' +
    '<th ' + thStyle + '>' + 'nickname' + '</th>' +
    '<th ' + thStyle + '>' + 'regtime' + '</th>'; 
  for(var i = 0; i < user.length; i++) {
    html += '<tr ' + trStyle + '>' +
      '<td ' + tdStyle + '>' + user[i].uid + '</td>' +
      '<td ' + tdStyle + '>' + user[i].mobile + '</td>' +
      '<td ' + tdStyle + '>' + user[i].nickname + '</td>' +
      '<td ' + tdStyle + '>' + getTime(user[i].regtime) + '</td></tr>';
  }
  html = html + "</table>";
  console.log(html);
  return html;
  
}


/* 商户发送邮件内容*/
function sendSellerHTML(seller) {

  var html = '<table ' + tableStyle + '>' +
    '<th ' + thStyle + '>' + 'seller_id' + '</th>' +
    '<th ' + thStyle + '>' + 'seller_name' + '</th>' +
    '<th ' + thStyle + '>' + 'contacter' + '</th>' +
    '<th ' + thStyle + '>' + 'contact_phone' + '</th>' +
    '<th ' + thStyle + '>' + 'province' + '</th>' +
    '<th ' + thStyle + '>' + 'city' +   '</th>' +
    '<th ' + thStyle + '>' + 'district' + '</th>' +
    '<th ' + thStyle + '>' + 'address' + '</th>' +
    '<th ' + thStyle + '>' + 'regtime' + '</th>';
  for(var i = 0; i < seller.length; i++) {
    html += '<tr ' + trStyle + '>' +
      '<td ' + tdStyle + '>' + seller[i].seller_id + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].seller_name + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].contacter + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].contact_phone + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].province + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].city + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].district + '</td>' +
      '<td ' + tdStyle + '>' + seller[i].address + '</td>' +
      '<td ' + tdStyle + '>' + getTime(seller[i].regtime) + '</td></tr>';
      

  }
  html = html + '</table>'
  console.log(html);
  return html
}

var http = require('http');
var mysql = require('mysql');
var request = require('request');
var APIKEY = process.env.APIKEY;
var url = "http://yunpian.com/v1/sms/send.json";
var mysqldb = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_NAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE
});

exports.ReOrder = function(){
  CheckAlerSend();
  var i = setInterval(CheckAlerSend, 720000);
}

/*检查已经发送过的信息*/
function CheckAlerSend() {
  mysqldb.query(
    "SELECT order_id, seller_id FROM test_send",
    function (err, rows) {
      if (err) {
        hadError(err);
      }
      var hadSend = rows;
      checkSend(hadSend);
    }
  );

}

/*检查需要发送的信息*/
function checkSend(hadSend) {
  mysqldb.query(
    "SELECT order_id, seller_id, add_time FROM `order` WHERE order_status =? AND is_delete=?", [1, 0],
    function (err, status) {
      if (err) {
        hadError(err);
      }
      var send = [];
      var sliceArry = [];
      var currTime = Date.parse(new Date()) / 1000;
      console.log("查到需要发送的", status);
      rmHadSend(status, send, currTime, sliceArry, hadSend);
    }
  );
}

/*从要发送的剔除发送过*/
function rmHadSend(status, send, currTime, sliceArry, hadSend) {
  /*push要发送的，以及要排除的*/
  for (var a = 0; a < status.length; a++) {
    if (currTime - status[a].add_time >= 900) {
      send.push(status[a]);
      for (var b = 0; b < hadSend.length; b++) {
        if (send[a].order_id == hadSend[b].order_id) {
          sliceArry.push(a);
        }
      }
    }
  }

  //剔除在要发送中已发送的
  var i = 0;
  for (var c = 0; c < sliceArry.length; c++) {
    send.splice(sliceArry[c - i], 1);
    i++;
  }

  //判断是否还有要发送的
  console.log("还要发送的", send);
  console.log(new Date());
  if (send.length) {
    //执行发送和插入发送过的到数据库
    mainFun(send);
  }
    

}

/*发送信息和更新已经发送的信息*/
function mainFun(send) {
  var hadMobile = '';
  for (var c = 0; c < send.length; c++) {
    (function (c) {
      //查询要发送商户的信息
      mysqldb.query(
        "SELECT contact_phone FROM seller_admin WHERE seller_id=? AND main=?", [send[c].seller_id, 1],
        function (err, seller) {
          if (err) {
            hadError(err);
          }
          if(seller.length){
            var mobile = seller[0].contact_phone;
            var time = exports.getLocalTime(send[c].add_time);
            var text = "您有订单尚未确认，下单时间" + time + "，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】";
            if (mobile != hadMobile) {
              hadMobile = mobile;
              //云片网发送信息
              YunPian(mobile, time, text);
            }
          }
          //将已经发送过的更新到数据库
          saveSend(send, c);
        }
      );

    }(c));
    

  }
  

}


function YunPian(mobile, time, text) {
  request.post(url, {
    form: {
      'apikey': APIKEY,
      'mobile': mobile,
      'text': text
    }
  }, function (err, res, body) {
    console.log(body);
  });



}


function saveSend(send, c) {
  mysqldb.query(
    "INSERT INTO test_send (seller_id, order_id) VALUES (?, ?)", [send[c].seller_id, send[c].order_id],
    function (err, info) {
      if (err) {
        hadError(err);
      }
      console.log(info);
    }
  );
  

}



function hadError(err) {
  console.log(err);
}

exports.getLocalTime = function getLocalTime(nS) {
  var year = new Date(parseInt(nS) * 1000).getFullYear();
  var month = new Date(parseInt(nS) * 1000).getMonth() + 1;
  month < 10 ? month = '0' + month : month = month;
  var day = new Date(parseInt(nS) * 1000).getDate();
  day < 10 ? day = '0' +day : day = day;
  var hours = new Date(parseInt(nS) * 1000).getHours();
  hours < 10 ? hours='0' + hours : hours = hours;
  //console.log(hours);
  var minu = new Date(parseInt(nS) * 1000).getMinutes();
  minu < 10 ? minu = '0' + minu : minu = minu;
  //console.log(minu);
  var time = year + '-' + month + '-' + day + ' ' + hours + ':' + minu
  //console.log(time);
  return time;
}




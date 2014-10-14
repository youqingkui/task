/**
 * Created by youqingkui on 14-9-15.
 */
var http     = require('http');
var mysql    = require('./mysql.js');
var request  = require('request');
var APIKEY   = process.env.APIKEY;
var url      = "http://yunpian.com/v1/sms/send.json";

// 链接mysql
mysqldb  = new mysql();
mysqldb.create();
var db   = mysqldb.db;


// 获取到已经发送过的订单
function getSend(){
  db.query(
    "SELECT * FROM test_send",
    function(err, alSend){
      if(err){
        return doNext(err);
      }
      doNext(null, alSend);
    }
  );
}

// 检查需要发送提醒订单
function needSend(alSend){
  db.query(
    "SELECT order_id, seller_id, add_time FROM `order` WHERE order_status =?",
    [1],
    function(err, rows){
      if(err){
        return doNext(err)
      }
      // 当前时间
      var currTime = Date.parse(new Date()) / 1000;

      // 需要发送的订单
      var needSend = [];

      // 检查订单是否15分钟未确认
      for(var i in rows){
        if(rows[i].add_time - currTime >= 900){
          needSend.push(rows[i]);
        }
      }

      doNext(null, alSend, needSend);
    }
  );
}

// 从需要发送里面剔除已经发送过的
function rmAlerySend(alSend, needSend){

  for(i in alSend){

    for(j in needSend){
      // 如果订单id相同，剔除
      if(alSend[i].order_id == needSend[j].order_id){
        needSend.splice(j, 1);
      }

    }
  }

  doNext(null, needSend);
}

// 得到商户信息
function getSellerInfo(needSend){

  var sellerInfo = [];
  for(i in needSend){

    (function(i){
      db.query(
        "SELECT contact_phone FROM seller_admin WHERE seller_id=? AND main=?",
        [needSend[i].seller_id, 1],
        function(err, result){
          if(err){
            doNext(err);
          }

          if(result.length){
            var seller = {
              'mobile': result[0].mobile,
              'time': getLocalTime(result[0].add_time)
            };
            sellerInfo.push(seller);
            // 如果已经是最后循环
            if(a == needSend.length - 1){
              doNext(null, sellerInfo);
            }
          }
        }
      );
    })(i);

  }
}

// 剔除重复的商户
function rmRepSeller(sellerInfo){


}
var mysql =require('mysql');
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var APIKEY = process.env.APIKEY;
var url = "http://yunpian.com/v1/sms/send.json";
var order = new EventEmitter();
var db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_NAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE
});
var j;

order.on('test', doListen);

function doListen(seller_id, order_id){
  j = setTimeout(doCheck, 5000, seller_id, order_id)
}

function doCheck(seller_id, order_id){
    db.query(
    "SELECT order_status, add_time FROM `order` WHERE seller_id =? AND order_id=?",
    [seller_id, order_id],
    function(err, orderInfo){
      if(err){ return console.log(err);}
      console.log(orderInfo);
      if(orderInfo[0].order_status ==1){
        db.query(
          "SELECT contact_phone FROM seller WHERE seller_id = ?",
          [seller_id],
          function(err, phone){
            if(err){return console.log(err);}
            console.log(phone);
            var time   = orderInfo[0].add_time;
            var mobile = phone[0].contact_phone;
            var text   = "您有订单尚未确认，下单时间" + time + "，请登录迈卡车生活商户版查看并确认订单！【迈卡车生活】";
            request(url, {form:{'apikey':APIKEY, 'text':text, 'mobile':mobile }}, function(err, res, body){
              if(err){ return console.log(err);} 
              console.log(body);
            });
          }
        ); 
      }
    }
  );
}

/*setInterval(function(){
  order.emit('test', '31', '163');
}, 300);
order.emit('test', '31', '163');

setTimeout(function(){
  clearTimeout(j);
  console.log("ok");
}, 1500);*/


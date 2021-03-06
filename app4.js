var express = require('express');
var app = express();
var nodemailer = require("nodemailer");
var http = require('http');
var fs = require('fs');
var logger = require('morgan');
var bodyParser = require('body-parser');
var userName = process.env.EMAIL_NAME;
var password = process.env.EMAIL_PWD;
var errorEmail = process.env.ERROR_EMAIL;
var mykarAddress = process.env.MYKAR_EMAIL;

var errSend     = require('./lib/errorSend.js');
var timeServer  = require('./lib/setTime.js');
var remberOrder = require('./lib/remOrder.js');

var accessLog = fs.createWriteStream('access.log', {
  flags: 'a'
});
var errorLog = fs.createWriteStream('error.log', {
  flags: 'a'
});

var smtpTransport = nodemailer.createTransport("SMTP", {
  host: "smtp.exmail.qq.com", // 主机
  secureConnection: true, // 使用 SSL
  port: 465, // SMTP 端口
  auth: {
    user: userName, // 账号
    pass: password // 密码
  }
});

app.use(logger({
  stream: accessLog
}));

/*开启服务*/
timeServer.TimeServe();
remberOrder.ReOrder();


app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true, limit: '200kb'}));
app.use(bodyParser.json({limit: '200kb'}));



app.post('/send', function (req, res) {
  var content = req.body.content;
  var subject = req.body.subject;
  var reAdd = req.body.address;
  if(!reAdd){
    reAdd = mykarAddress; 
  }
  var mailOptions = {
    from: userName, // 发件地址
    to: reAdd, // 收件列表
    subject: subject, // 标题
    html: content // html 内容
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      var sendContent = JSON.stringify({
        status: 0,
        msg: '邮件发送失败',
        info: error
      });
/*      res.setHeader('Content-Length', Buffer.byteLength(sendContent));
      res.setHeader('Content-Type', 'text/javascript');
      res.send(sendContent);
      */
      console.log(sendContent);
      
      errSend.errSend(subject, content, reAdd, error, userName, errorEmail, smtpTransport, nodemailer);
      console.log(error);
    } else {
      var sendContent = JSON.stringify({
        status: 1,
        msg: '邮件发送成功'
      });
/*      res.setHeader('Content-Length', Buffer.byteLength(sendContent));
      res.setHeader('Content-Type', 'text/javascript');
      res.send(sendContent);*/
      console.log(sendContent);
      console.log("Message sent: " + response.message);
      //smtpTransport.close(); // 如果没用，关闭连接池
    }
    
    
  });
  
  var text = '已经调用发送邮件接口';
  res.setHeader('Content-Length', Buffer.byteLength(text));
  res.send(text);

});



app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

app.listen(3000, 'localhost');

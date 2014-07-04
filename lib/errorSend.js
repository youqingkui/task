
/*邮件发送失败调用函数*/
exports.errSend = function(subject, content, reAdd, err, userName, errorEmail, smtpTransport, nodemailer) {
  var html = "<h2>发送给:" + reAdd + "</h2>" +
    "<h2>主题:" + subject + "</h2>" +
    "<h2>错误信息:" + err + "</h2>" +
    "<h3>邮件内容:" + content + "</h3>";
  var mailErrorOptions = {
    from: userName, // 发件地址
    to: errorEmail, // 接收错误收件列表
    subject: "邮件错误提醒", // 标题
    'html': html // html 内容
  };
  smtpTransport.sendMail(mailErrorOptions, function (error, response) {
    if (error) {
      var sendContent = JSON.stringify({
        status: 0,
        msg: '发送错误提醒失败',
        info: error
      });
      console.log(error);
      console.log(sendContent);
    } else {
      var sendContent = JSON.stringify({
        status: 1,
        msg: '错误提醒邮件发送成功'
      });
      console.log("Message sent: " + response.message);
      console.log(sendContent);
    }
    smtpTransport.close(); // 如果没用，关闭连接池
  });
}
var schedule = require("node-schedule");
var request = require("request");

exports.TimeServe = function () {
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(6, 6)];
  rule.hour = 9;
  rule.minute = 0;
  console.log('wait');
  var j = schedule.scheduleJob(rule, function () {
    nowDate();
  });

};

function nowDate(){
  var utcNow  = Date.parse(new Date()) / 1000;
  var nowDate = getLocalTime(utcNow);
  var timeTaskURL = "http://localhost:5002/time_task/" + nowDate;
  request(timeTaskURL, function(err, response, body){
    if(err){
      console.log(err);
    }
    console.log(body);
  });


}


function getLocalTime(nS) {
  var year = new Date(parseInt(nS) * 1000).getFullYear();
  var month = new Date(parseInt(nS) * 1000).getMonth() + 1;
  month < 10 ? month = '0' + month : month = month;
  var day = new Date(parseInt(nS) * 1000).getDate();
  day < 10 ? day = '0' +day : day = day;
  var time = year + '-' + month + '-' + day;
  //console.log(time);
  return time;
}


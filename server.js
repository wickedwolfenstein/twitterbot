//Binance Market Watch App by Praveen Udhayasuriyan.
// Possible improvements UI for changing the Threshold, Ticker and Tweet Interval
//Node JS Server Variables;
const express = require('express');
const bodyParser = require('body-parser');
const ws = require('ws');
//Twitter API Keys
const Twitter = require('twitter');
var client = new Twitter({
  consumer_key: '2FuxLkb9v1Y7tHm75YAC8B8s0',
  consumer_secret: 'AUB2ZuoFO9e29me272D6pWtGYo1tM08th5SLUfDGyvcz5OZHjr',
  access_token_key: '975343141623496704-0avI1DINxeg1yjwxCmbCf0cazKDGeDw',
  access_token_secret: 'Y1kbwQO0u71AC5jBCoR21BOw8mgVwNNPc6vh4bWhCBie7'
});
// Server Parameters
var pvethresh = 5;
var nvethresh = -5;
var tweetInterval = 3600000;
const port = 1406;
var Ticker = "bnbusdt";
var mw;
var reconInterval;

var app = express();
var war;
app.listen(port, function () {
  console.log("Twitter bot listening on port : " + port);
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var percent;


app.post('/changeTweetInterval', function (req, res) {
  var temp = parseInt(req.body.Interval);
  tweetInterval = temp;
  if (mw != undefined) {
    clearInterval(mw);
  }
  marketWatch();
  console.log("Tweet Interval changed to " + tweetInterval);

  return res.status(200).send();
});

app.post('/changeThreshold', function (req, res) {
  var temp = parseFloat(req.body.Threshold);
  if (temp > 0) {
    pvethresh = temp;
  }
  else {
    nvethresh = temp;
  }
  return res.status(200).send();
});

app.post('/changeTicker', function (req, res) {
  var temp = req.body.Ticker;
  Ticker = temp;
  connect(Ticker);
  return res.status(200).send();
});

function connect(ticker) {
  if (war != undefined) {
    war.close();
    console.log("Connection Close");
  }
  war = new ws("wss://stream.binance.com:9443/ws/" + ticker + "@ticker");
  war.on('open', function open() {
    console.log("Connected to websocket " + ticker);
    if (reconInterval != undefined || reconInterval != null) {
      console.log("Reconnected.");
      clearInterval(reconInterval);
    }
  });

  war.on('message', function incoming(data) {
    //console.log(data.P);
    var tempObj = JSON.parse(data);
    percent = parseFloat(tempObj.P);
    console.log(percent);
  });
  war.on('disconnect', function () {
    reconInterval = setInterval(
      function () {
        console.log("Trying to reconnect....");
        connect(ticker);
      }, 5000);
  });
}

connect(Ticker);
marketWatch();

function marketWatch() {
  mw = setInterval(function () {
    if (percent >= pvethresh) {
      var twet = {status: Ticker + " is UP by " + percent + " " + new Date().toLocaleString()};
      client.post('statuses/update', twet, function (error, tweet, response) {
        //console.log(tweet);  // Tweet body.
        //console.log(response);  // Raw response object.
        if (!error) {
          //console.log('Posted Tweet ' + twet);
        }
        console.log(error);
      });
    }
    else if (percent <= nvethresh) {
      var twet = {status: Ticker + " is DOWN by " + percent + " " + new Date().toLocaleString()};
      client.post('statuses/update', twet, function (error, tweet, response) {
        //console.log(tweet);  // Tweet body.
        //console.log(response);  // Raw response object.
        if (!error) {
          //console.log('Posted Tweet ' + twet);
        }
        console.log(error);
      });
    }
  }, tweetInterval);
}




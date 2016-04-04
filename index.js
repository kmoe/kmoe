var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var config = require('./config.json');

var twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var port = process.env.PORT || 1337;

app.use(bodyParser.json());



app.get('/', function (req, res) {
  res.send('Hello World!');
});


var pendingAuthRequest;

// GET /auth
// sends request to katy to perform auth procedure
app.get('/auth', function(req, res) {
  // if (!req.secure) {
  //   res.send({
  //     error: 'use httpsplz'
  //   });
  // }

  if (req.hostname !== 'localhost') {
    res.send({
      error: 'just localhost for now'
    });
  }

  twilioClient.messages.create({
    to: process.env.PHONE_KATY,
    from: process.env.PHONE_SELF,
    body: 'NFC auth request from  ' + req.hostname,
  }, function(error, message) {
    if (error) {
      res.send({
        error: error
      });
    }
    console.log('Twilio message sent: ' + message.sid);
  });

  res.send({
    error: null,
    message: 'successful request, katy'
  });
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});

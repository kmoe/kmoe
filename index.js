'use strict';

const Hapi = require('hapi');

const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: process.env.PORT || 1337
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    return reply('hello world');
  }
});

server.route({
  method: 'GET',
  path: '/auth',
  handler: (request, reply) => {
    if (request.info.hostname !== 'localhost') {
      return reply({
        error: 'just localhost for now'
      });
    }

    return twilioClient.messages.create({
      to: process.env.PHONE_KATY,
      from: process.env.PHONE_SELF,
      body: 'NFC auth request from  ' + request.hostname,
    }, (error, message) => {
      if (error) {
        return reply({
          error: error
        });
      }
      console.log('Twilio message sent: ' + message.sid);
      return reply({
        error: null,
        message: 'successful request, katy'
      });
    });
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

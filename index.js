'use strict';

const Hapi = require('hapi');
const Good = require('good');
const GoodLoggly = require('good-loggly');

const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 1337
});

const options = {
  reporters: [
    {
      reporter: require('good-console'),
      events: {
        response: '*',
        log: '*',
        request: '*'
      }
    },
    {
      reporter: GoodLoggly,
      events: {
        response: '*',
        log: '*',
        request: '*'
      },
      config: {
        token: process.env.LOGGLY_TOKEN,
        subdomain: process.env.LOGGLY_SUBDOMAIN,
        name: 'kmoe',
        hostname: 'kmoe.heroku.com',
        tags: ['good-loggly']
      }
    }
  ]
};

server.register({
  register: Good,
  options
}, (err) => {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start((err) => {
    if (err) {
       throw err;
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    server.log('info', 'base route');
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

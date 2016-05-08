'use strict';

const Hapi = require('hapi');
const Good = require('good');
const notp = require('notp');
const GoodLoggly = require('good-loggly');

const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const EventEmitter = require('events');
const emitter = new EventEmitter();

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

    return reply('no');

    // return twilioClient.messages.create({
    //   to: process.env.PHONE_KATY,
    //   from: process.env.PHONE_SELF,
    //   body: 'NFC auth request from  ' + request.hostname,
    // }, (error, message) => {
    //   if (error) {
    //     return reply({
    //       error: error
    //     });
    //   }
    //   console.log('Twilio message sent: ' + message.sid);
    //   return reply({
    //     error: null,
    //     message: 'successful request, katy'
    //   });
    // });
  }
});

server.route({
  method: 'POST',
  path: '/auth',
  handler: (request, reply) => {
    console.log(request.payload);

    if (!request.payload) {
      emitter.emit('auth_failure');
      return reply('well shit, you forgot the payload');
    }

    if (notp.totp.verify(request.payload.token, process.env.TOTP_KEY)) {
      console.log('success verifying totp');
      emitter.emit('auth_success');
      return reply('SUCCESSSSSSS');
    } else {
      console.log('nope');
      emitter.emit('auth_failure');
      return reply('auth failed :(');
    }
  }
});

server.route({
  method: 'GET',
  path: '/verify',
  config: {
    timeout: {
      server: 100000
    },
  },
  handler: (request, reply) => {
    server.log('verification request from ', request.info.hostname);

    //send text to katy
    //include time limit

    emitter.on('auth_failure', () => {
      return reply('auth failed');
    });

    emitter.on('auth_success', () => {
      return reply('auth succeeded!!!!!!!1');
    });
  }
});
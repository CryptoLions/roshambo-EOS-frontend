/*
  App configuration test local created by Cryptolions
*/

const path = require('path');
let config = {};

// production mod
config.PROD = false;

config.saveRequestsMetrics = true;
config.contractName = 'roshambogame';

// mongo uri and options
config.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ROSHAMBO_DEV';
config.MONGO_OPTIONS = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    useNewUrlParser: true
};

// api url for history
config.daemonsON = true;
config.historyChain = 'https://history.cryptolions.io';

config.updateHistoryTime = 60; // every 5 sec
config.apiV = 'v1'; // api version

// log4js
config.logger = {
    appenders: {
      out:  {
            type: 'stdout'
      },
      server: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/server.log'),
      },
      history_daemon: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/history_daemon.log'),
      },
      top_100: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/top_100.log'),
      }
    },
    categories: {
        default:       {
          appenders: ['out'],
          level:     'trace'
        },
        server:  {
          appenders: ['out', 'server'],
          level:     'trace'
        },
        history_daemon:  {
          appenders: ['out', 'history_daemon'],
          level:     'trace'
        },
        top_100:  {
          appenders: ['out', 'top_100'],
          level:     'trace'
        }
    }
};

// slack notifications
config.loggerSlack = {
      alerts: {
        type: 'slack',
        token: '',
        channel_id: '',
        username: 'System bot',
      }
};

module.exports = config;



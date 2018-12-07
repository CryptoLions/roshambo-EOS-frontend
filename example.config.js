/*
  App configuration test local created by eoswebnetbp1 (31.08.18)
*/

const path = require('path');
let config = {};

// production mod
config.PROD = false;

config.saveRequestsMetrics = true;

// mongo uri and options
config.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ROSHAMBO_DEV';
config.MONGO_OPTIONS = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    useNewUrlParser: true
};

// eosjs
config.eosConfig = {
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  httpEndpoint: 'http://bp.cryptolions.io',
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true,
  logger: {
    //log: console.log,
    error: console.error
  }
};

// scatter wallet
config.walletAPI = {
        host: 'nodes.get-scatter.com',
        port: '',
        protocol: 'https'
};

// api url for producers list
config.customChain = 'https://nodes.get-scatter.com';

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
      socket_io: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/socket_io.log'),
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
        socket_io:  {
          appenders: ['out', 'socket_io'],
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



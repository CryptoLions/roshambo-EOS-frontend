/*
   Created by orange1337
*/
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var MODEL_NAME = 'HISTORY';
var TABLE_NAME = 'HISTORY';
var MODEL;

// Model without any fixed schema
var HISTORY = new mongoose.Schema({}, { strict: false });

module.exports = function (connection) {
  if ( !MODEL ) {
    if ( !connection ) {
      connection = mongoose;
    }
    MODEL = connection.model(MODEL_NAME, HISTORY, TABLE_NAME);
  }
  return MODEL;
};




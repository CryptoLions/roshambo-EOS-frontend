// Accounts analytics for airdrops (public info)
const async			= require('async');
const mongoose      = require('mongoose');
const request 		= require('request');
const config      	= require('../../config');

const log4js      = require('log4js');
log4js.configure(config.logger);
const log         = log4js.getLogger('history_daemon');

const customSlack = require('../modules/slack.module');
const logSlack    = customSlack.configure(config.loggerSlack.alerts);

mongoose.Promise = global.Promise;
const mongoMain  = mongoose.createConnection(config.MONGO_URI, config.MONGO_OPTIONS,
 (err) => {
    if (err){
      log.error(err);
      process.exit(1);
    }
    log.info('[Connected to Mongo EOS in history daemon] : 27017');
});

const HISTORY 		= require('../models/history.model')(mongoMain);
const SETTINGS 		= require('../models/global.model')(mongoMain);


process.on('uncaughtException', (err) => {
	// rewrite to slack notify
    logSlack(`======= UncaughtException Accounts daemon server : ${err}`);
    process.exit(1);
});

function getAccountAggregation(){
	async.waterfall([
		(cb) => {
			SETTINGS.findOne({}, (err, result) => {
				if (err){
					return cb(err);
				}
				if (result){
					return cb(null, result);
				}
				let stat = new SETTINGS();
				stat.save( (err) => {
					if (err){
						return cb(err);
					}
					cb(null, stat);
				});
			});
		},
		(stat, cb) => {
			getActions(stat, cb);
		},
		(stat, cb) => {
			stat.save((err) => {
			   		if (err){
			   			return cb(err);
			   		}
			   		cb(null, stat);
			});
		}
	], (err, stat) => {
		if (err){
			log.error(err);
			process.exit(1);
		}
		log.info('===== end accounts aggr stat ', stat);
		process.exit(0);
	});
}

let elemsCounter = 0;
function getActions(stat, cb){
	let limit = 1000;
	let skip = stat.cursor_history;
	let url = `${config.historyChain}/v1/history/get_actions/roshambogame/winns?sort=1&skip=${skip}&limit=${limit}`;
	request.get(url, (error, response, body) => {
			if (error){
				return cb(error);
			}
			if (!body){
				return cb(body);
			}
			let data = JSON.parse(body);
			if (!data || !data.actions){
				return cb('Wrong data accounts data!!');
			}
			if (data.actions.length === 0){
				return cb(null, stat);
			}
			saveAccounts(data, (err, result) => {
					if (err){
						return cb(err);
					}
					skip += limit;
					stat.cursor_history += data.actions.length;
					console.log('===== skip', skip, 'cursor_history', stat.cursor_history);
					getActions(stat, cb);
			});
	});
}

function saveAccounts (data, callback){
		console.log('actions length', data.actions.length);
	   	async.each(data.actions, (action, cb) => {
	   		HISTORY.find({ _id: action._id }, (err, result) => {
	   			if (err){
	   				log.error(err);
	   				return cb();
	   			}
	   			if (result && result.length){
	   				return cb();
	   			}
	   			let stat_acc = new HISTORY(action);
	   			stat_acc.save((err) => {
	   				if (err){
	   					log.error(err);
	   				}
	   				cb();
	   			})
	   		});
	   	}, (err) => {
	   		if (err){
	   			log.error(err);	
	   		}
	   		callback(null);
	   	});
}

getAccountAggregation();






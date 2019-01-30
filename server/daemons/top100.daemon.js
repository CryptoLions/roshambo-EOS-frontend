// Accounts analytics for airdrops (public info)
const async			= require('async');
const mongoose      = require('mongoose');
const request 		= require('request');
const config      	= require('../../config');

const log4js      = require('log4js');
log4js.configure(config.logger);
const log         = log4js.getLogger('top_100');

const customSlack = require('../modules/slack.module');
const logSlack    = customSlack.configure(config.loggerSlack.alerts);

mongoose.Promise = global.Promise;
const mongoMain  = mongoose.createConnection(config.MONGO_URI, config.MONGO_OPTIONS,
 (err) => {
    if (err){
      log.error(err);
      process.exit(1);
    }
    log.info('[Connected to Mongo EOS in top_100 daemon] : 27017');
});

const HISTORY 		= require('../models/history.model')(mongoMain);
const SETTINGS 		= require('../models/global.model')(mongoMain);


process.on('uncaughtException', (err) => {
	// rewrite to slack notify
    logSlack(`======= UncaughtException Accounts daemon server : ${err}`);
    process.exit(1);
});


    async.parallel({
	  	winns: (cb) => {
			HISTORY.aggregate([
				   			{ $group: {
				   					_id: "$act.data.winner",
				   					winns: { $sum: 1 }
				   			    } 
				   			}
			]).exec(cb);
	  	},
	  	host: (cb) => {
			HISTORY.aggregate([
				   			{ $group: {
				   					_id: "$act.data.host",
				   					games_played: { $sum: 1 }
				   			    } 
				   			}
			]).exec(cb);
	  	},
	  	challenger: (cb) => {
			HISTORY.aggregate([
				   			{ $group: {
				   					_id: "$act.data.challenger",
				   					games_played: { $sum: 1 }
				   			    } 
				   			}
			]).exec(cb);
	  	}
	}, (err, result) => {
		if (err){
			log.error(err);
			process.exit(1);
		}
		let table = createTableWinners(result);
		//console.log(table);
		SETTINGS.findOneAndUpdate({}, { table_winners: table }, (err) => {
			if (err){
				log.error(err);
				process.exit(1);
			}
			console.log('======= Top 100 daemon Sucessfully built Table winners =======');
			process.exit(0);
		});
	});

function createTableWinners(result){
	let table = {};
	result.winns.forEach(elem => {
			if (elem._id !== "self"){
				table[elem._id] = { winns: elem.winns };
			}
	});
	result.host.forEach(elem => {
			if (!table[elem._id]){
				return table[elem._id] = { winns: 0, games_played: elem.games_played };
			}
			if (!table[elem._id].games_played){
				return table[elem._id] = { winns: table[elem._id].winns,  games_played: elem.games_played}; 
			}
	});	
	result.challenger.forEach(elem => {
			if (!table[elem._id]){
				return table[elem._id] = { winns: 0, games_played: elem.games_played };
			}
			if (!table[elem._id].games_played){
				return table[elem._id] = { winns: table[elem._id].winns, games_played: elem.games_played}; 
			}
			table[elem._id].games_played += elem.games_played;		
	});
	return sortTableWinners(table);	
}

function sortTableWinners(table){
		var result = [];
		Object.keys(table).forEach(function(key, index){
			if(key === "self" || key === "none" || key === "null"){
				return;
			}
			result.push({ player: key, games_played: table[key].games_played, games_win: table[key].winns });
		});
		result.sort(function(a, b){
				if (a.games_win === b.games_win){
					if (a.games_played > b.games_played) return 1;
					if (a.games_played < b.games_played) return -1;
					return 0;	
				}
				if (a.games_win > b.games_win) return -1;
				if (a.games_win < b.games_win) return 1;
				return 0;
		});
		return result;
}





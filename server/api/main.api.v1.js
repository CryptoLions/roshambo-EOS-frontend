/*
   Created by eoswebnetbp1
*/

const async = require('async');
const path 	= require('path');
const cors  = require('cors');

module.exports 	= function(router, config, request, log, mongoMain) {

	const HISTORY = require('../models/history.model')(mongoMain);
	const SETTINGS = require('../models/global.model')(mongoMain);

	router.get('/api/v1/top100', (req, res) => {
			SETTINGS.findOne({}, 'table_winners', (err, result) => {
				if (err){
	   				log.error(err);
	   				return res.status(500).end();
	   			}
	   			res.json(result);
			});
	});

	router.get('/api/v1/games/log', (req, res) => {
			let lastGames = 50;
			async.parallel({
				allGames: (cb) => {
					HISTORY.count(cb);
				},
				history: (cb) => {
					HISTORY.find({}).sort({ _id: -1 }).limit(lastGames).exec(cb);
				}
			}, (err, result) => {
				if (err){
	   				log.error(err);
	   				return res.status(500).end();
	   			}
	   			res.json(result);
			})
	   		
	});

	router.get('/api/v1/last/game/:accountName', cors(), (req, res) => {
			let accountName = req.params.accountName;
			HISTORY.find({ winner: accountName }, (err, result) => {
					if (err){
						log.error(err);
	   					return res.status(500).end();
					}
					if (result.length){
						return res.json({ whitepaper: true });
					}
					res.json({ whitepaper: false });
			});
	});

// ============== end of exports 
};

























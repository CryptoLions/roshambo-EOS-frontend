/*
* Created by Rost
*/
const path = require('path');

module.exports = function(router, config, request, log) {

	const indexPath = path.join(__dirname, '../../dist/index.html');

	router.get('/', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/top100', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/mygame/:user/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});

	router.get('/call/:user/:id', (req, res) => {
	   	res.sendFile(indexPath);
	});

	/*router.get('/sitemap.xml', (req, res) => {
	   	res.sendFile(path.join(__dirname, '../../sitemap.xml'));
	});

	router.get('/robots.txt', (req, res) => {
	   	res.sendFile(path.join(__dirname, '../../robots.txt'));
	});*/
// ============== END of exports 
};





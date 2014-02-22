var qs = require('querystring');
var config = require('../config');
var log = require('../log');

var request = require('superagent');
var fs = require('fs');

exports.register = function(app) {

	app.get('/', function(req, res) {
		res.render('index');
	});

}

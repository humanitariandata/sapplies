'use-strict';

// Setup the required node modules and config files
var express = require('express'),
    app = express(),
    mongo = require('mongoskin'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    config = require('./config/config.js'),
    secrets = require('./config/secrets.json');

app.use(express.static(__dirname + '/app'));

// Set a prefix for the REST API
var apiPrefix = '/api/v1';

// Create a db connection using the node module mongoskin
var db = mongo.db("mongodb://localhost:27017/sapplies", {native_parser:true});

// Bind all the collections to the db
db.bind('offers');
db.bind('needs');

// Root uri for the Angular webapp
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/app/index.html');
});

// CRUD: Needs
app.get(apiPrefix+'/needs.json', function(req, res) {
  db.needs.find().toArray(function(err, items) {
    if(err) throw err;
    res.send(items);
  });
});
app.get(apiPrefix+'/needs/:id', function(req, res) {
  //req.params.id
  db.needs.findById({ _id: req.params.id }).toArray(function(err, items) {
    if(err) throw err;
    res.send(items);
  });
});

// CRUD: offers
app.get(apiPrefix+'/offers.json', function(req, res) {
	res.send({ "offers": "offers" });
});
app.get(apiPrefix+'/offers/:id', function(req, res) {
  //req.params.id
  db.offers.findById({ _id: req.params.id }).toArray(function(err, items) {
    if(err) throw err;
    res.send(items);
  });
});

// Close the db connection
db.close();

/*
 * HTTPS and SSL configuration
 * Set certicicates and start SSL server
 */
if (config.usessl) {

  var sslconfig = {};
  if(config.hasOwnProperty('pfx_file')){
    sslconfig.pfx = fs.readFileSync(path.resolve(__dirname, config.pfx_file), 'UTF-8');
  }
  else if (config.hasOwnProperty('key_file') && config.hasOwnProperty('cert_file')){
    sslconfig.key = fs.readFileSync(path.resolve(__dirname, config.key_file), 'UTF-8');
    sslconfig.cert = fs.readFileSync(path.resolve(__dirname, config.cert_file), 'UTF-8');
  }

  if(secrets.certificate.passphrase) {
    sslconfig.passphrase = secrets.certificate.passphrase;
  }

  https.createServer(sslconfig, app).listen(config.sslport);

  console.log('Application started on port ' + config.sslport);
} else {
  // Use just http instead of https
  console.log('localhost:3001');
  app.listen(3001);
}

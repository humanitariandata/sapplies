'use-strict';

// Setup the required node modules and config files
var express = require('express'),
    app = express(),
    mongo = require('mongoskin'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    config = require('./config/config.js'),
    secrets = require('./config/secrets.json');

var ObjectID = mongo.ObjectID;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/fb'));

// Enable reverse proxy
app.enable('trust proxy');

// Redirect all http requests to https
// If environment is development, remove the port
app.use(function(req, res, next) {
	var protocol = req.protocol;
	if (config.usessl) {
		if (!req.secure) {
		    if(process.env.NODE_ENV === 'development') {
		      return res.redirect('https://localhost' + req.url);
		    } else {
		      return res.redirect('https://' + req.headers.host + req.url);
		    }
		} else {
		    return next();
		}
	} else {
		return next();
	}
});

// Set a prefix for the REST API
var apiPrefix = '/api/v1';

// Create a db connection using the node module mongoskin
var db = mongo.db("mongodb://localhost:27017/sapplies", {native_parser:true});

// Init database
//db.createCollection('offers');
//db.createCollection('needs');

// Bind all the collections to the db
db.bind('offers');
db.bind('needs');
db.bind('categories');

//db.offers.insert({ title: "Init offers" }, function(err) {});
//db.needs.insert({ title: "Init needs" }, function(err){});

// Root uri for the Angular webapp
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/app/index.html');
});

app.get('/fb', function(req, res) {
  res.sendfile(__dirname + '/fb/index.html');
});

/*
 * CRUD: Needs
 */

// FIND
app.get(apiPrefix+'/needs', function(req, res) {
   db.needs.find().sort({_id:-1}).toArray(function(err, docs) {
      if(err) throw err;
      res.send(docs);
   });
});
// FIND ONE
app.get(apiPrefix+'/needs/:id', function(req, res) {
  //req.params.id
  db.needs.findOne({ _id: new ObjectID(req.params.id) }, function(err, docs) {
    if(err) throw err;
    res.send(docs);
  });
});
// CREATE
app.post(apiPrefix+'/needs', function(req, res) {
  db.needs.insert(req.body, function(err, docs) {
    if(err) throw err;
    console.log(docs);
  });
});
// DELETE
app.delete(apiPrefix+'/needs/:id', function(req, res) {
  //req.params.id
  db.needs.remove({ _id: new ObjectID(req.params.id) }).toArray(function(err, docs) {
    if(err) throw err;
    res.send(docs);
  });
});

/*
 * CRUD: Offers
 */

 // FIND
app.get(apiPrefix+'/offers', function(req, res) {
	db.offers.find().sort({_id:-1}).toArray(function(err, docs) {
   if(err) throw err;
   res.send(docs);
 });
});

// FIND ONE
app.get(apiPrefix+'/offers/:id', function(req, res) {
  //req.params.id
  db.offers.findOne({ _id: new ObjectID(req.params.id) }, function(err, docs) {
    if(err) throw err;
    res.send(docs);
  });
});

/*
 * CRUD: Matches
 */

// FIND
app.get(apiPrefix+'/matches', function(req, res) {
   db.matches.find().sort({ id: -1 }).toArray(function(err, docs) {
      if(err) throw err;
      res.send(docs);
   });
});

/*
 * Categories
 */
app.get(apiPrefix+'/categories', function(req, res) {
   db.categories.find().sort({ name: 1 }).toArray(function(err, docs) {
      if(err) throw err;
      res.send(docs);
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

  // https start
  console.log('Application started on port ' + config.sslport);
}

// http start as well
console.log('Application started on port ' + config.mainPort);
app.listen(config.mainPort);

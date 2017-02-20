process.env.NODE_ENV = process.env.NODE_ENV || 'local';

var config = require('./config')(process.env.NODE_ENV);
var express = require('express');
var app = express();

console.log("Operating in " + process.env.NODE_ENV + " environment");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// we need to use cors in dev becuase of port difference, but should
// be removed in prod because we don't want to respond to other tools
var cors = require('cors');
var helmet = require('helmet');
app.use(cors());
app.use(helmet());
app.disable('Server');
// error handler

// router middle ware
var router = express.Router();
require('./routes')(router);
// all of our routes will be registered at the / prefix
app.use('/', router);

var port = process.env.PORT || config.PORT ||3001;

app.listen(port, function () {
  console.log('ResumeKings API Web listening on port ' + port + '!');
});

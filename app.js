'use strict'

require('dotenv').load();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");

// app
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;;
const host = process.env.HOST || 'localhost';

// view engine
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set base root
app.use(express.static(`${__dirname}/public`));

// connect db
require('./dbconn')();

// connect routes
require('./api/api')(app);
require('./api/routes')(app);
require('./api/email')(app);

// start server
server.listen(port, host);
console.log(`Magic is happening on ${port}`);
"use strict";

var express = require('express');
var body_parser = require('body-parser');
var routes = require('./src/routes.js');
var app = express();

app.use(body_parser.json({ extended: true }));

routes(app);

var server = app.listen(3560, function() {
    console.log('app running', server.address().port);
});


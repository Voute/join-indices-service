"use strict";

var log4js = require('log4js');
var fs = require('fs');

log4js.configure({
    appenders: { ijs_main: {
        type: 'file',
        filename: './logs/ijs.log',
        maxLogSize: 5242880,    //5mb
        backups: 5
    } },
    categories: { default: { appenders: ['ijs_main'], level: 'trace' } }
});

module.exports = log4js;
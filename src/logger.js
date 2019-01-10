var log4js = require('log4js');
var fs = require('fs');

    // fs.exists('./logs', function(exists) {
    //     // if (exists == false) {
    //     //     fs.mkdirSync('./logs');
    //     // }
            
    //     log4js.configure({
    //         appenders: { ijs_main: {
    //             type: 'file',
    //             filename: './logs/ijs.log',
    //             maxLogSize: 5242880,    //5mb
    //             backups: 5
    //         } },
    //         categories: { default: { appenders: ['ijs_main'], level: 'trace' } }
    //     });
        
    // });
    log4js.configure({
        appenders: { ijs_main: {
            type: 'file',
            filename: './logs/ijs.log',
            maxLogSize: 5242880,    //5mb
            backups: 5
        } },
        categories: { default: { appenders: ['ijs_main'], level: 'trace' } }
    });


//module.exports = initiateLogger;
module.exports = log4js;
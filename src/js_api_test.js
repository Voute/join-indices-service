var express = require('express');
var body_parser = require('body-parser');
var routes = require('./routes.js');
var app = express();

//app.use(body_parser.json());
app.use(body_parser.json({ extended: true }));

routes(app);

var server = app.listen(3560, function() {
    console.log('app running', server.address().port);
});


// app.post('/p', function(req, res) {
//     console.log('get request recieved');

//     console.log(req.body.field1);
//     res.status(200).send('response');
// });


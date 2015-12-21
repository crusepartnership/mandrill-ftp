var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var router = express.Router();
var ftp = require('ftp');
var config = require(__dirname + '/config/config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.post('/', function (req, res) {
    var messages = JSON.parse(req.param('mandrill_events'));
    console.log(messages);
    _.each(messages, function (message) {
        console.log(message.msg.text);
    });
    return res.status(200).send({message: 'OK'});
});

app.use('/', router);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
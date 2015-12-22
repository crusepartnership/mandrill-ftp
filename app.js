var express = require('express');
var path = require('path');
var util = require('util');
var bodyParser = require('body-parser');
var Logger = require(__dirname + '/lib/logger');
var Uploader = require(__dirname + '/lib/uploader');
var _ = require('lodash');
var app = express();
var router = express.Router();
var config = require(__dirname + '/config/config.json');
var log = new Logger(config);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.post('/', function (req, res) {
    var messages = JSON.parse(req.body.mandrill_events);
    _.each(messages, function (message) {
        var msg = message.msg;
        var rules = _.find(config.rules, 'subject', msg.subject);
        var renameFilename = false;
        if (rules !== undefined) {
            renameFilename = rules.filename;
        }
        var route = _.find(config.routes, 'email', msg.email);
        if (route !== undefined) {
            var uploader = new Uploader(route.destination, log);
            log.info(util.format('Found route route email %s', route.email));
            if (msg.attachments !== undefined) {
                _.each(msg.attachments, function (attachment) {
                    uploader.upload(attachment.name, attachment.content);
                });
            } else {
                log.error(util.format("No attachments found on email to route %s", route.email));
            }
        }
        log.info(msg.text);
    });

    return res.status(200).send({message: 'OK'});
});

app.use('/', router);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

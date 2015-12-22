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

/**
 * Webhook to receive mandrill events
 */
router.post('/', function (req, res) {
    var messages = JSON.parse(req.body.mandrill_events);
    _.each(messages, function (message) {
        var msg = message.msg;
        log.info(util.format('Message received to %s with subject %s', msg.email, msg.subject));
        var route = _.find(config.routes, 'email', msg.email);
        if (route !== undefined) {
            var rules = _.find(route.rules, 'subject', msg.subject);
            var renameFilename = false;
            if (rules !== undefined) {
                renameFilename = rules.filename;
            }
            var uploader = new Uploader(route.destination);
            log.info(util.format('Found route: email %s', route.email));
            if (msg.attachments !== undefined) {
                var i = 0;
                _.each(msg.attachments, function (attachment) {
                    var uploadName = attachment.name;
                    if (renameFilename) {
                        uploadName = (i > 0) ? util.format('%s-%s', i, renameFilename) : renameFilename;
                    }
                    console.log(uploadName);
                    uploader.upload(uploadName, attachment.content)
                        .then(function (message) {
                            log.info(message);
                        })
                        .catch(function (message) {
                            log.error(message);
                        });
                });
            } else {
                log.error(util.format("No attachments found on email to route %s", route.email));
            }
        }
    });

    return res.status(200).send({message: 'OK'});
});

/**
 * Reload configuration
 */
router.get('/reload', function(req, res) {
    config = require(__dirname + '/config/config.json');
    return res.status(200).send({message: 'OK'});
});

app.use('/', router);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

var fs = require('fs');
var Ftps = require('ftps');
var util = require('util');

var Uploader = function (config, logger) {
    console.log(config);
    this.config = config;
    this.logger = logger;
    this.tempPath = __dirname + '/../tmp/';
    this.client = new Ftps(config);
};


Uploader.prototype.upload = function (filename, fileContent) {
    var self = this;
    var filePath = util.format('%s%s', this.tempPath, filename);
    if (fs.existsSync(this.tempPath) === false) {
        fs.mkdirSync(this.tempPath);
    }
    fs.writeFileSync(filePath, fileContent);
    this.logger.info(util.format('Uploading file %s to %s', filename, this.config.host));
    this.client.put(filePath, this.config.path).exec(function(err, res) {
        self.logger.info(res);
    });
};

module.exports = Uploader;
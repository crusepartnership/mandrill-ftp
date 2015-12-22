var fs = require('fs');
var Ftps = require('ftps');
var util = require('util');
var Q = require('q');

function Uploader(config) {
    this.config = config;
    this.tempPath = __dirname + '/../tmp/';
    this.client = new Ftps(config);
};

Uploader.prototype.upload = function (filename, fileContent) {
    var self = this;
    var deferred = Q.defer();
    var filePath = util.format('%s%s', this.tempPath, filename);
    if (fs.existsSync(this.tempPath) === false) {
        fs.mkdirSync(this.tempPath);
    }
    fs.writeFileSync(filePath, fileContent);
    this.client.put(filePath, this.config.path).exec(function(err, res) {
        if (res.error !== null) {
            deferred.reject(new Error(util.format('Error on upload: %s', res.error)));
        } else {
            deferred.resolve(util.format('Completed uploading file %s to %s', filename, self.config.host));
        }
    });

    return deferred.promise;
};

module.exports = Uploader;

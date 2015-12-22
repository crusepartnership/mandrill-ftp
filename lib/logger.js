function Logger(config) {
    this.config = config;
    this.log = false;
    if (config !== undefined) {
        this.log = require('gelf-pro');
        this.log.setConfig({
            fields: {'host': "mandrill-ftp", facility: "mandrill-ftp"},
            adapterName: 'udp',
            adapterOptions: {
                protocol: 'udp4',
                family: 4,
                host: config.log.host,
                port: config.log.port || 12201
            }
        });
    }
};

Logger.prototype.info = function(msg) {
    if (this.log !== false) {
        this.log.info(msg);
    }
};

Logger.prototype.error = function(msg) {
    if (this.log !== false) {
        this.log.error(msg);
    }
};

module.exports = Logger;

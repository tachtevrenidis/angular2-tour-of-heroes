var connect = require('connect');
var serveStatic = require('serve-static');
var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
connect().use(serveStatic(__dirname)).listen(port,host);
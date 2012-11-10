var os = require('os');
var redis = require("redis");
var dbName = 'addressbook';

var NodeAddressbook = module.exports = function(port, host, redisOpt) {
  var client = this.client = redis.createClient(port, host, redisOpt);
  client.on('error', function(err) {
    console.error(err);
  });
  this.myAddress;
  this.protocols;
  this.addressbook;
};

var returnCallBack = function(cb, err, data) {
  if (!cb) {
    console.error('callback function is mandatory');
    process.exit(0);
  }
  process.nextTick(cb.bind(err, data));
};

NodeAddressbook.prototype.update = function(protocols, cb) {
  //protocols = [{
  //  protocol: 'tcp',
  //  port: '6789'
  //}];
  if (typeof protocols === 'function') {
    cb = protocols;
    protocols = undefined;
  }
  if (protocols && ! Array.isArray(protocols)) {
    returnCallBack(cb, 'protocols has to be an Array');
  }
  if (!protocols) {
    protocols = this.protocols;
    if (!protocols) {
      returnCallBack(cb, 'protocols has to be provided at least once');
    }
  }

  // get the network IP
  // http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
  var ifaces = os.networkInterfaces();
  var en0;
  for (var dev in ifaces) {
    ifaces[dev].forEach(function(details) {
      if (details.family === 'IPv4' || details.family === 'IPv6') {
        if (dev === 'en0' && !en0) {
          en0 = details.address;
        }
      }
    });
  }

  if (!en0) {
    returnCallBack(cb, 'No network IP found');
  } else {
    var client = this.client;

    if (en0 !== this.myAddress || protocols !== this.protocols) {
      this.myAddress = en0;
      this.protocols = protocols;
      client.hset(dbName, en0, JSON.stringify(protocols), function(err, res) {
        if (err) {
          returnCallBack(cb, err);
        } else if (res !== 0) {
          returnCallBack(cb, 'Redis did not return 0');
        }
      });
    }

    client.hgetall(dbName, function(err, data) {
      returnCallBack(cb, err, JSON.parse(data));
    });
  }
};


var os = require('os');
var redis = require("redis");
var dbName = 'addressbook';

var Addressbook = module.exports = function Addressbook(port, host, options, password) {
  if (! (this instanceof Addressbook)) { // enforcing new
    return new Addressbook(port, host, options, password);
  }

  this.port = port;
  this.host = host;
  this.options = options;
  this.password = password;
  var connect = function() {
    var client = this.client = redis.createClient(this.port, this.host, this.options).on('error', function(err) {
      console.error(err, 'reconnecting');
      connect.call(this);
    });
    var password = this.password;
    if (password) {
      client.auth(password, function() {});
    }
  };
  connect.call(this);
  this.myAddress = ''; // ip address of local machine, either IPv4 or IPv6
  this.myContacts = []; // local server servicies e.g., [{port:portnumber}, ...]
  this.addressbook = {}; // remote server servicies e.g., {ipaddress:[{port:portnumber}, ...], ...}
};

var returnCallBack = function returnCallBack(cb, err, data) {
  if (! (err instanceof Error)) {
    err = new Error(err);
  }
  if (cb) {
    // until setImmediate() is available, let's use bind for now
    process.nextTick(cb.bind(null, err, data));
  } else {
    throw err;
  }
};

Addressbook.prototype.update = function update(myContacts, cb) {
  var i;
  var self = this;
  if (typeof myContacts === 'function') {
    cb = myContacts;
    myContacts = undefined;
  }
  if (myContacts) {
    if (!Array.isArray(myContacts)) {
      returnCallBack(cb, 'myContacts has to be an Array');
      return;
    } else {
      for (i = myContacts.length; i--;) {
        if (! (myContacts[i].port && myContacts[i].protocol)) {
          returnCallBack(cb, 'each contact in myContacts has to have a port number');
          return;
        }
      }
    }
  } else {
    myContacts = this.myContacts;
  }

  // get the network IP
  // http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
  var ifaces = os.networkInterfaces();
  var en0;
  for (var dev in ifaces) {
    var ifacesDev = ifaces[dev];
    for (i = ifacesDev.length; i--;) {
      var details = ifacesDev[i];
      if (details.family === 'IPv4' || details.family === 'IPv6') {
        if (dev === 'en0' && ! en0) {
          en0 = details.address;
        }
      }
    }
  }

  if (!en0) {
    returnCallBack(cb, 'No network IP found');
    return;
  } else {
    var client = this.client;

    if (en0 !== this.myAddress || myContacts !== this.myContacts) {
      this.myAddress = en0;
      this.myContacts = myContacts;
      if (myContacts) {
        client.hset(dbName, en0, JSON.stringify(myContacts), function(err, res) {
          if (err) {
            returnCallBack(cb, err);
            return;
          } else if (res !== 0) {
            returnCallBack(cb, 'Redis did not return 0, but returned', res);
            return;
          }
        });
      }
    }

    client.hgetall(dbName, function(err, data) {
      var addressbook = {};
      self.addressbook = addressbook;
      for (var key in data) {
        addressbook[key] = JSON.parse(data[key]);
      }
      returnCallBack(cb, err, addressbook);
      return;
    });
  }
};

Addressbook.prototype.pick = function pick(n) {
  var addressbook = this.addressbook;
  var host;
  var c = 0;
  for (var key in addressbook) {
    if (Math.random() * ++c < 1) {
      host = key;
    }
  }
  var ret = addressbook[host];
  ret.host = host;
  return ret;
};


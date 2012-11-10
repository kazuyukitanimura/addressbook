var AB = require('addressbook');
var ab = new AB();
var myServicies = [{port: 3000, protocol: 'http'}, {port: 5004, protocol: 'dnode'}];
ab.update(myServicies, function(err, addressbook) {
  if (err) {
    throw err;
  } else {
    console.log(addressbook);
  }
});
ab.pick(); // => return randomly picked remote service


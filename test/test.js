var assert = require("assert");
var Addressbook = require('../index');
var myServicies = [{
  port: 3000,
  protocol: 'http'
},
{
  port: 5004,
  protocol: 'dnode'
}];

describe('Addressbook', function() {
  describe('#update()', function() {
    it('should return {ipaddress:[{port:portnumber}, ...], ...}', function(done) {
      var ab = Addressbook();
      ab.update(function(err, addressbook) {
        assert(err instanceof Error);
      });
      ab.update(myServicies, function(err, addressbook) {
        for (var key in addressbook) {
          var contacts = addressbook[key];
          assert(Array.isArray(contacts));
          for (var i = contacts.length; i--;) {
            var contact = contacts[i];
            assert(contact.port);
            assert.deepEqual(typeof contact.port, 'number');
            assert(contact.protocol);
            assert.deepEqual(typeof contact.protocol, 'string');
          }
        }
        assert.deepEqual(ab.addressbook, addressbook);
        done();
      });
    });
  });
  describe('#pick(n)', function() {
    it('should return [{port:portnumber}, ...]', function(done) {
      var ab = Addressbook();
      ab.update(function(err, addressbook) {
        assert(ab.pick().port);
      });
      done();
    });
  });
});


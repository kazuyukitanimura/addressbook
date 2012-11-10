addressbook
============
`addressbook` keeps tracking available node instances backed by Redis.

## Prerequisites
Redis `>=2.6.4`.

On Mac with homebrew,
```bash
$ homebrew install redis
$ redis-server
```

## Installation
```bash
$ npm install addressbook
```

## Version
    0.0.1 (pre-release)

# Usage
```js
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
ab.pick(); // => return a randomly picked remote service
```

# API
## ab.([port], [host], [options], [passowrd])

## ab.update([myServicies], [callback])

## ab.pick()

# Test
```bash
$ npm test
```

# License
MIT

Copyright (c) 2012 Kazuyuki Tanimura

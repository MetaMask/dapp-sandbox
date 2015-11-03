// polyfill Object.observe
require('object.observe')
extend = require('xtend')

module.exports = PrefixedStorage

var defaultStorage = null

try {
  defaultStorage = window.localStorage
} catch (_) {
  defaultStorage = {}
}

function PrefixedStorage(prefix, storageObj) {
  var self = this
  storageObj = storageObj || defaultStorage
  Object.defineProperty(self, '_storageObj', { value: storageObj })
  Object.defineProperty(self, '_prefix', { value: prefix })

  // load existing storage
  getPrefixedKeys(storageObj, prefix)
  .forEach(loadFromStorage)

  // observe direct sets on PrefixedStorage
  Object.observe(self, function(changes){ changes.forEach(handleChange) })

  function loadFromStorage(key){
    var unprefixedKey = key.slice(prefix.length)
    self[unprefixedKey] = storageObj[key]
  }

  function handleChange(change){
    if (change.type === 'delete') {
      self.removeItem(change.name)
    } else {
      var newValue = self[change.name]
      self.setItem(change.name, newValue)
    }
  }
}

PrefixedStorage.prototype.setData = function(data) {
  var self = this
  // remove previous data
  self.clear()
  // inject new data
  Object.keys(data)
  .forEach(function(key){ self.setItem(key, data[key]) })
}


PrefixedStorage.prototype.setItem = function(key, value) {
  var self = this
  var prefix = self._prefix
  var storageObj = self._storageObj

  storageObj[prefix+key] = value
  var oldValue = self[key]
  if (oldValue !== value) {
    self[key] = value
  }
  return value
}

PrefixedStorage.prototype.getItem = function(key) {
  var self = this
  var prefix = self._prefix
  var storageObj = self._storageObj
  
  var value = storageObj[prefix+key]
  return value
}

PrefixedStorage.prototype.removeItem = function(key, value) {
  var self = this
  var prefix = self._prefix
  var storageObj = self._storageObj

  delete storageObj[prefix+key]
  delete self[key]
}

PrefixedStorage.prototype.clear = function() {
  var self = this
  var prefix = self._prefix
  var storageObj = self._storageObj

  getPrefixedKeys(storageObj, prefix)
  .forEach(function(key){ delete self[key] })
}

PrefixedStorage.prototype.toJSON = function() {
  var self = this
  var data = extend(self)
  return data
}

function getPrefixedKeys(storageObj, prefix){
  return Object.keys(storageObj).filter(function startsWithPrefix(key){
    return key.slice(0, prefix.length) === prefix
  })
}
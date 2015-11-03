extend = require('xtend')

module.exports = FakeSessionStorage


function FakeSessionStorage(initData) {
  var self = this
  initData = initData || {}
  // load initial data onto self
  Object.keys(initData).forEach(function(key){ self[key] = initData[key] })
}

FakeSessionStorage.prototype.setItem = function(key, value) {
  var self = this
  self[key] = value
  return value
}

FakeSessionStorage.prototype.getItem = function(key) {
  var self = this
  value = self[key]
  return value
}

FakeSessionStorage.prototype.removeItem = function(key) {
  var self = this
  delete self[key]
  return true
}

FakeSessionStorage.prototype.clear = function() {
  var self = this
  Object.keys(self).forEach(function(key){ delete self[key] })
}

FakeSessionStorage.prototype.toJSON = function() {
  var self = this
  var data = extend(self)
  return data
}
const semaphore = require('semaphore')

module.exports = SimpleLock

function SimpleLock() {
  this._sem = semaphore(1)
}

SimpleLock.prototype.lock = function(){
  var self = this
  self._sem.take(function(){})
}

SimpleLock.prototype.unlock = function(){
  var self = this
  self._sem.leave()
}

SimpleLock.prototype.await = function(fn){
  var self = this
  self._sem.take(function(){
    self._sem.leave()
    fn()
  })
}

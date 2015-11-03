const eos = require('end-of-stream')
const WriteStream = require('stream').Writable
const inherits = require('util').inherits

module.exports = DomStream


inherits(DomStream, WriteStream)

function DomStream(){
  var self = this
  WriteStream.call(self)
  document.open()
  eos(self, writeClose.bind(self))
}

DomStream.prototype._write = function(chunk, encoding, cb){
  var self = this
  var src = chunk.toString()
  // console.log('dom stream data:', src)
  document.write(src)
  cb()
}

function writeClose() {
  var self = this
  self.emit('beforeClose')
  document.close()
}
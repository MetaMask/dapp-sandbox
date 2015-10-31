const eos = require('end-of-stream')
const WriteStream = require('stream').Writable
const inherits = require('util').inherits

module.exports = DomStream


inherits(DomStream, WriteStream)

function DomStream(){
  var self = this
  WriteStream.call(this)
  document.open()
  eos(self, writeClose)
}

DomStream.prototype._write = function(chunk, encoding, cb){
  var src = chunk.toString()
  // console.log('dom stream data:', src)
  document.write(src)
  cb()
}

function writeClose() {
  document.close()
}
const RPC = require('frame-rpc')
const XhrStream = require('xhr-stream')
const DomStream = require('./lib/dom-stream.js')
const initializeEnvironment = require('./initEnv.js')
const urlToBaseUrl = require('./util.js').urlToBaseUrl

// must be created before any listeners on DOM
var domStream = new DomStream()

var config = null

var origin = document.referrer || '*'
var rpc = RPC(window, window.parent, origin, {
  navigateTo: navigateTo,
  initialize: initialize,
})

function signTx(txParams){
  rpc.call('signTx', txParams, cb)
}

function initialize(_config){
  config = _config
}

function navigateTo(url){
  config.BASE_URL = urlToBaseUrl(url)
  initializeEnvironment({
    signTx: signTx,
    vaporConfig: config,
  })
  rpc.call('urlChanged', url)
  loadUrl(url)
  // simulateUsage()
}

function loadUrl(targetUrl){
  var proxiedUrl = config.TRANSFORM_URL+'html/'+encodeURIComponent(targetUrl)
  new XhrStream(proxiedUrl)
  .pipe(domStream)
}

function simulateUsage(){
  setTimeout(function(){
    rpc.call('urlChanged', 'https://happydapp.com/fishes/')
    setTimeout(function(){
      rpc.call('signTx', {a:1, b:2}, function(err, tx){
        console.log('tx was signed!', err, tx)
      })
    }, 2000)
  }, 2000)
}



// var ParentStream = require('./iframe-stream.js').ParentStream
// var Dnode = require('dnode')
// var fifoTransform = require('fifo-transform')

// var parentStream = ParentStream()
// var rpc = Dnode({
//   eval: evalGlobal,
//   write: write,
//   writeClose: writeClose,
// })

// parentStream
//   .pipe(new fifoTransform.unwrap())
//   .pipe(rpc)
//   .pipe(new fifoTransform.wrap())
//   .pipe(parentStream)

// rpc.on('remote', function(parentController){
//   global.sandboxMessage = parentController.sendMessage.bind(parentController)
// })

// var docIsOpen = false

// function write(src, cb) {
//   if (!docIsOpen) {
//     document.open()
//     docIsOpen = true
//     // reset the listener after opening the dom
//     parentStream._setupListener()
//   }
//   document.write(src)
//   if (cb) cb()
// }

// function writeClose(src, cb) {
//   docIsOpen = false
//   document.close()
//   if (cb) cb()
// }

// function evalGlobal(src, cb) {
//   try {
//     // eval with global context
//     var result = (0,eval)(src)
//     cb(null, result)
//   } catch (err) {
//     cb(err)
//   }
// }

// function noop(){}
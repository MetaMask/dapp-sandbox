const RPC = require('frame-rpc')
const XhrStream = require('xhr-stream')
const DomStream = require('./lib/dom-stream.js')
const initializeEnvironment = require('./initEnv.js').initializeEnvironment
const setupHandlers = require('./initEnv.js').setupHandlers
const urlToBaseUrl = require('./util.js').urlToBaseUrl


var config = null

var origin = document.referrer || '*'
var rpc = RPC(window, window.parent, origin, {
  navigateTo: navigateTo,
  initialize: function(_config){ config = _config },
})


function signTx(txParams, cb){
  rpc.call('signTx', txParams, cb)
}

function urlChanged(url){
  rpc.call('urlChanged', url)
}

function navigateTo(url){
  config.BASE_URL = urlToBaseUrl(url)
  initializeEnvironment({
    signTx: signTx,
    urlChanged: urlChanged,
    config: config,
  })
  urlChanged(url)
  loadUrl(url)
  // simulateUsage()
}

function loadUrl(targetUrl){
  // DOM handlers must be created after document write has started
  var domStream = new DomStream()
  domStream.on('beforeClose', function(){
    setupHandlers({
      navigateTo: navigateTo,
    })
  })
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

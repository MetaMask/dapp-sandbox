const RPC = require('frame-rpc')
const XhrStream = require('xhr-stream')
const DomStream = require('./lib/dom-stream.js')
const initializeEnvironment = require('./initEnv.js').initializeEnvironment
const setupHandlers = require('./initEnv.js').setupHandlers
const urlToBaseUrl = require('./util.js').urlToBaseUrl


var config = null

var origin = document.referrer || '*'
var rpc = RPC(window, window.parent, origin, {
  initialize: function(_config){ config = _config },
  navigateTo: navigateTo,
})

function urlChanged(url){ rpc.call('urlChanged', url) }

function navigateTo(url, localStorageData, sessionStorageData){
  config.BASE_URL = urlToBaseUrl(url)
  initializeEnvironment({
    config: config,
    urlChanged: urlChanged,
    processWeb3Payload: function(payload, cb){ rpc.call('processWeb3Payload', payload, cb) },
    updateLocalStorage: function(data){ rpc.call('updateLocalStorage', data) },
    updateSessionStorage: function(data){ rpc.call('updateSessionStorage', data) },
  })
  __VAPOR_RUNTIME__.setLocalStorage(localStorageData)
  __VAPOR_RUNTIME__.setSessionStorage(sessionStorageData)
  loadUrl(url)
  urlChanged(url)
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

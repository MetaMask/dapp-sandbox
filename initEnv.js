// polyfill Object.observe
require('object.observe')
const urlUtil = require('url')
const extend = require('xtend')
const FakeSessionStorage = require('./lib/session-storage.js')
const FakeLocation = require('./lib/location.js')
const FakeHistory = require('./lib/history.js')
var FakeXMLHttpRequest = require('./lib/xhr.js')
const ethereum = require('./lib/ethereum.js')
const interceptLinks = require('./lib/intercept-links.js')
const uniq = require('uniq')

module.exports = {
  initializeEnvironment: initializeEnvironment,
  setupHandlers: setupHandlers,
}


var windowPrototype = window.__proto__
var _setTimeout = window.setTimeout
var _setInterval = window.setInterval
var _addEventListener = window.addEventListener


function initializeEnvironment(opts){

  //
  // expose environment variables
  //

  var vaporConfig = opts.config
  PROXY_URL = vaporConfig.PROXY_URL

  //
  // setup global objects
  //

  // parse origin
  var baseUrl = vaporConfig.BASE_URL
  var baseUrlData = urlUtil.parse(baseUrl)

  // bind classes to origin
  var location = new FakeLocation(baseUrl)
  location.on('change', opts.urlChanged)
  FakeXMLHttpRequest = FakeXMLHttpRequest.bind(null, baseUrlData)

  // create globals
  var windowGlobal = {}
  var documentGlobal = {}

  // store globals on document
  window.__VAPOR_RUNTIME__ = {
    originalWindow: window,
    originalDocument: document,
    windowGlobal: windowGlobal,
    documentGlobal: documentGlobal,
    baseUrl: baseUrl,
    baseUrlData: baseUrlData,
    config: vaporConfig,
    setLocalStorage: setLocalStorage,
    setSessionStorage: setSessionStorage,
  }

  function setLocalStorage(initData){
    windowGlobal.localStorage = new FakeSessionStorage(initData)
    Object.observe(windowGlobal.localStorage, function(){
      var data = windowGlobal.localStorage.toJSON()
      opts.updateLocalStorage(data)
    })
  }

  function setSessionStorage(initData){
    windowGlobal.sessionStorage = new FakeSessionStorage(initData)
    Object.observe(windowGlobal.sessionStorage, function(){
      var data = windowGlobal.sessionStorage.toJSON()
      opts.updateSessionStorage(data)
    })
  }

  //
  // copy all properties
  //

  var SKIP = {}

  //
  // window
  //

  var windowGlobalOverrides = {
    window: windowGlobal,
    top: windowGlobal,
    document: documentGlobal,
    frameElement: null,
    history: new FakeHistory(baseUrlData, location),
    location: SKIP,
    localStorage: SKIP,
    sessionStorage: SKIP,
  }

  var windowGlobalExtras = {
    XMLHttpRequest: FakeXMLHttpRequest,
    addEventListener: fakeAddEventListener,
    removeEventListener: fakeRemoveEventListener,
    // ethereum specific
    web3: ethereum(baseUrlData, vaporConfig.addresses, opts.signTx),
  }

  var externalGlobals = {/* INSERT EXTERNAL GLOBALS HERE */}
  // windowGlobalExtras = extend(windowGlobalExtras, externalGlobals)

  // cloneOntoObject(window, windowGlobal, windowGlobalOverrides, windowGlobalExtras)

  // setup prototype chain

  // in context -> RealWindow ( must copy all props here onto FakeWindow )
  //               FakeWindow <- accessed via `window`
  //               WindowPrototype
  //               EventTarget
  //               Object

  // var windowEventTarget = window.__proto__
  // window.__proto__ = windowGlobal
  // windowGlobal.__proto__ = windowEventTarget

  windowGlobalOverrides = extend(windowGlobalOverrides, windowGlobalExtras, externalGlobals)
  hackThePlanet(window, windowGlobal, windowGlobalOverrides, true)
  // setup prototype chain
  hookPrototypalChain()

  //
  // document
  //

  var documentGlobalOverrides = {
    location: SKIP,
  }

  var documentGlobalExtras = {
    cookie: '',
    defaultView: windowGlobal,
  }

  // cloneOntoObject(document, documentGlobal, documentGlobalOverrides, documentGlobalExtras)
  documentGlobalOverrides = extend(documentGlobalOverrides, documentGlobalExtras)
  hackThePlanet(document, documentGlobal, documentGlobalOverrides)
  // setup prototype chain
  documentGlobal.__proto__ = document

  //
  // additional overrides
  //

  // location, history

  Object.defineProperty(windowGlobal, 'location', {
    get: function(){
      return location
    },
    set: function(value){
      location.replace(value)
      return value
    },
  })

  Object.defineProperty(documentGlobal, 'location', {
    get: function(){
      return location
    },
    set: function(value){
      location.replace(value)
      return value
    },
  })


  //
  // ==================== util ===============
  //

  function noop(){}

  function hackThePlanet(source, target, overrides, handleHooking) {
    overrides = overrides || {}

    // 1) properties on source
    var props = getAllPropertyNames(source)
    for (var index in props) {
      var key = props[index]
      // set value from override
      if (key in overrides) {
        continue
      // no override - use value on original object
      } else {
        // accessing properties can trigger security-related DOMExceptions
        // so we wrap in a try-catch
        try {
          // bind functions
          var value = source[key]
          if (typeof value === 'function' && !nameIsBuiltinConstructor(key)) {
            target[key] = value.bind(source)
          // setup setter/getters for correct fallback (avoid illegal invocation error)
          } else {
            Object.defineProperty(target, key, {
              get: (handleHooking ? getterWithHooking : getter).bind(null, source, key),
              set: (handleHooking ? setterWithHooking : setter).bind(null, source, key),
            })
          }
        } catch (_) {}
      }
    }
    
    // 2) overrides and extras
    for (var key in overrides) {
      var value = overrides[key]
      if (value === SKIP) continue
      target[key] = value
    }

    function getter(source, key){
      return source[key]
    }

    function setter(source, key, value){
      var out = source[key] = value
      return out
    }

    function getterWithHooking(source, key){
      unhookPrototypalChain()
      var value = getter(source, key)
      hookPrototypalChain()
      return value
    }

    function setterWithHooking(source, key, value){
      unhookPrototypalChain()
      var value = setter(source, key, value)
      hookPrototypalChain()
      return value
    }

  }

  function hookPrototypalChain(){
    window.__proto__ = windowGlobal
    windowGlobal.__proto__ = windowPrototype
  }

  function unhookPrototypalChain(){
    window.__proto__ = windowPrototype
  }

  function getAllPropertyNames( obj ) {
    var props = []
    do {
      props = props.concat(Object.getOwnPropertyNames( obj ))
    } while ( obj = Object.getPrototypeOf( obj ) )
    uniq(props)
    return props
  }

  // heuristic for determining if its a constructor
  function nameIsBuiltinConstructor(key){
    var firstChar = key.slice(0,1)
    var isCapital = firstChar !== firstChar.toLowerCase()
    var onWindow = window.hasOwnProperty(key)
    return isCapital && onWindow
  }

  // add event listener
  function fakeAddEventListener(type, listener, useCapture) {
    _addEventListener(type, function(event){
      var newEvent = event
      if (event.source === window) {
        // wrap event object to shadow source
        newEvent = {}
        hackThePlanet(event, newEvent, { source: windowGlobal })
      }
      listener.call(windowGlobal, newEvent)
    }, useCapture)
  }

  function fakeRemoveEventListener(type, listener, useCapture) {
    console.warn('vapor - removeEventListener called - not implemented')
  }

}

function setupHandlers(opts){
  // intercept links to redirect to html transforming links
  interceptLinks(opts.navigateTo)
}
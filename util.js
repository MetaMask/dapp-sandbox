const urlUtil = require('url')
const PROXY_URL = process.env.PROXY_URL || 'https://proxy.metamask.io/'

module.exports = {
  urlToBaseUrl: urlToBaseUrl,
  resolveUrl: resolveUrl,
  proxyUrl: proxyUrl,
  urlForHtmlTransform: urlForHtmlTransform,
  urlForJsTransform: urlForJsTransform,
  urlForCssTransform: urlForCssTransform,
  noop: noop,
}

// get the 'current directory' of a url
function urlToBaseUrl(targetUrl){
  // parse origin
  var baseUrl = targetUrl
  var baseUrlData = urlUtil.parse(baseUrl)
  var path = baseUrlData.path.split('/')
  var pathSuffix = path[path.length-1]
  // if baseUrlData is file, resolve to parent dir
  if (pathSuffix.indexOf('.') !== -1) {
    var amendedPath = path.slice(0,-1).join('/')+'/'
    baseUrl = baseUrlData.protocol+'//'+baseUrlData.host+amendedPath
  }
  return baseUrl
}

// resolve a relative url against a base url
function resolveUrl(srcUrl, baseUrlData) {
  if (!baseUrlData) {
    baseUrlData = __VAPOR_RUNTIME__.baseUrlData
  }
  if (typeof baseUrlData === 'string') {
    baseUrlData = urlUtil.parse(baseUrlData)
  }
  var pathname = baseUrlData.pathname

  if (pathname.slice(-1) !== '/') pathname += '/'
  var relPath = urlUtil.resolve(baseUrlData.protocol+'//'+baseUrlData.host, pathname)
  var result = urlUtil.resolve(relPath, srcUrl)
  // console.log('URL RESOLVE:', srcUrl, '=>', result)
  return result
}

function proxyUrl(target) {
  // whitelist localhost
  if (-1 !== target.indexOf('localhost:')) {
    return target
  } else {
    return PROXY_URL + target
  }
}

function urlForHtmlTransform(target) {
  var VAPOR_CONFIG = __VAPOR_RUNTIME__.config
  var TRANSFORM_BASE_URL = VAPOR_CONFIG.TRANSFORM_BASE_URL || 'https://transform-beta.metamask.io/'
  var TRANSFORM_HTML_URL = process.env.TRANSFORM_HTML_URL || TRANSFORM_BASE_URL + 'html/'
  return TRANSFORM_HTML_URL + encodeURIComponent(target)
}

function urlForJsTransform(target) {
  var VAPOR_CONFIG = __VAPOR_RUNTIME__.config
  var TRANSFORM_BASE_URL = VAPOR_CONFIG.TRANSFORM_BASE_URL || process.env.TRANSFORM_BASE_URL || 'https://transform.metamask.io/'
  var TRANSFORM_JS_URL = process.env.TRANSFORM_JS_URL || TRANSFORM_BASE_URL + 'js/'
  return TRANSFORM_JS_URL + encodeURIComponent(target)
}

function urlForCssTransform(target) {
  var VAPOR_CONFIG = __VAPOR_RUNTIME__.config
  var TRANSFORM_BASE_URL = VAPOR_CONFIG.TRANSFORM_BASE_URL || process.env.TRANSFORM_BASE_URL || 'https://transform.metamask.io/'
  var TRANSFORM_CSS_URL = process.env.TRANSFORM_CSS_URL || TRANSFORM_BASE_URL + 'css/'
  return TRANSFORM_CSS_URL + encodeURIComponent(target)
}

function noop(){}
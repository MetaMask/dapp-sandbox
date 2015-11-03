const util = require('../util.js')

module.exports = function(navigateTo){
  // to be the last event handler, you need to be the last to subscribe
  // in order to ensure this we:
  // 1) add a capture handler, to run before bubbling
  // 2) when triggered, add a bubble handler that points to our actual handler
  document.addEventListener('click', earlyClickHandler, true)

  function earlyClickHandler(){
    // abort if target not an anchor tag or in a link
    if (!findAncestor(event.target, 'a[href]')) return
    // setup lastClickHandler
    document.addEventListener('click', lateClickHandler, false)
    function lateClickHandler(event){
      document.removeEventListener('click', lateClickHandler, false)
      lastClickHandler(event)
    }
  }

  function lastClickHandler(event) {
    // abort if already handled
    if (event.defaultPrevented) return
    // intercept navigation
    event.preventDefault()
    var anchor = event.target
    var originalUrl = anchor.getAttribute('href')
    var resolvedUrl = util.resolveUrl(originalUrl)
    console.log('navigation from:', originalUrl)
    console.log('redirecting to:', resolvedUrl)
    navigateTo(resolvedUrl)
  }

}

function findAncestor(node, sel) {
  while (node && node.matches) {
    if (node.matches(sel)) {
      return node
    }
    node = node.parentNode
  }
  return null
}
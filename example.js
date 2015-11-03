var DappSandbox = require('./index.js')

// 'ev-event': hg.sendSubmit(state.channels.submit)

sandbox = new DappSandbox({
  container: document.body,
  config: {
    PROXY_URL: 'https://proxy-beta.metamask.io/',
    TRANSFORM_URL: 'https://transform-beta.metamask.io/',
  },
  addresses: ['0x985095ef977ba75fb2bb79cd5c4b84c81392dff6'],
})

// css
sandbox.iframe.style.height = '100%'
document.body.style.height = '100%'
document.body.style.margin = '0px'
document.documentElement.style.height = '100%'

// sandbox.on('load', function(){
//   console.log('loaded')  
// })

sandbox.on('url', function(url){
  console.log('sandbox url changed:', url)
})

sandbox.on('tx', function(txParams, cb){
  console.log('tx sig requested:', txParams)
})

sandbox.navigateTo('http://meteor-dapp-boardroom.meteor.com/boardroom/0x34f210097f0c4fccac3d65f94c6450b9a50010ab/')
// sandbox.navigateTo('http://xkcd.com/1597')
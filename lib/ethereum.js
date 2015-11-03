var Web3 = require('web3')
var BlockAppsProvider = require('blockapps-web3')
var Transaction = require('ethereumjs-tx')

module.exports = getEthereum

function getEthereum(origin, addresses, signTx) {
  // global.sandboxMessage is provided by iframe-sandbox

  var provider = new BlockAppsProvider({
    // temporary: use proxy to get SSL
    host: 'https://proxy.metamask.io/http://hacknet.blockapps.net',
    // host: 'http://hacknet.blockapps.net',
    // host: 'http://api.blockapps.net',
    transaction_signer: { 
      hasAddress: function(address, callback) {
        var hasAddress = addresses.indexOf(address) !== -1
        callback(null, hasAddress)
      },
      signTransaction: signTx,
    },
    coinbase: addresses[0],
    accounts: addresses,
  });

  var web3 = new Web3(provider)
  // disable set provider method
  web3.setProvider = function(){ console.log('web3.setProvider blocked by MetaMask.') }

  return web3
}
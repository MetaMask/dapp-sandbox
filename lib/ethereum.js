const Web3 = require('web3')
// const BlockAppsProvider = require('blockapps-web3')
const RemoteWeb3Provider = require('./remote-provider.js')
const Transaction = require('ethereumjs-tx')

module.exports = getEthereum

function getEthereum(accounts, processWeb3Payload) {
  // global.sandboxMessage is provided by iframe-sandbox

  var provider = new RemoteWeb3Provider({
    sendAsync: processWeb3Payload,
    accounts: accounts,
  })

  var web3 = new Web3(provider)
  // disable set provider method
  web3.setProvider = function(){ console.log('web3.setProvider blocked by MetaMask.') }

  return web3
}
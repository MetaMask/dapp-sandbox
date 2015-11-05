module.exports = RemoteWeb3Provider


function RemoteWeb3Provider(opts){
  opts = opts || {}
  var self = this
  self.accounts = opts.accounts || []
  if (opts.sendAsync) self.sendAsync = opts.sendAsync
}

RemoteWeb3Provider.prototype.sendAsync = function(){
  throw new Error('RemoteWeb3Provider needs sendAsync to be overwritten.');
}

RemoteWeb3Provider.prototype.send = function(payload){
  var self = this
  switch (payload.method) {
    case 'eth_accounts':
      var response = {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result: self.accounts,
      }
      return response
  }
  throw new Error('RemoteWeb3Provider does not support synchronous methods. Please provide a callback.');
}
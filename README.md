### DappSandbox

[![Greenkeeper badge](https://badges.greenkeeper.io/kumavis/dapp-sandbox.svg)](https://greenkeeper.io/)

```js
var sandbox = new DappSandbox({
  container: document.body,
})

sandbox.navigateTo('https://happydapp.com/toothpaste')
```

### api

###### new DappSandbox(opts)

```js
opts = {
  container: document.body,
}
```

Will inject an iframe into the container.

###### sandbox.iframe

The iframe element.

###### sandbox.navigateTo(url)

navigates the sandbox to url, may trigger `url` event.

###### sandbox.on('url', function(url){...})

emitted when the url changes

###### sandbox.on('tx', function(tx, cb){...})

emitted when a tx is requested to be signed

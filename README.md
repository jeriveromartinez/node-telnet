## Installation
```bash
$ npm install node-telnet --save
```

## Usage
```js
const client = require('node-telnet');

const opts = {
  host: '127.0.0.1', // normally '127.0.0.1', will default to if undefined
  port: 1337, //port openvpn management console
  timeout: 1500, //timeout for connection - optional, will default to 1500ms if undefined
  logpath: 'log.txt' //optional write openvpn console output to file, can be relative path or absolute
};
const auth = {
  user: 'vpnUserName',
  pass: 'vpnPassword',
};
const connection = client.connect(opts)

// will be emited on successful interfacing with openvpn instance
connection.on('connected', () => {
  client.authorize(auth);
});

// emits console output of openvpn instance as a string
connection.on('console-output', output => {
  console.log(output)
});

// emits console output of openvpn state as a array
connection.on('state-change', state => {
  console.log(state)
});

// emits console output of openvpn state as a string
connection.on('error', error => {
  console.log(error)
});

// get all console logs up to this point
client.getLog(console.log)

// and finally when/if you want to
client.disconnect();

// emits on disconnect
connection.on('disconnected', () => {
  // finally destroy the disconnected manager 
  client.destroy()
});
```

const {Bus} = require('./bus')

const bus = new Bus({})

// Interfaces
const payload = {}
bus.init() // init connection to bus. will autoused with publisher and subscriber methods
bus.close() // close connection to the bus. stop all listener's subscribtions

// For Pub Sub Pattern
bus
  .publisher('pubsub:topic:example') // required, string with topic name
  .withExchangeType('topc') // optional, overwrite default exchange type
  .publish(payload)

bus
  .subscriber('pubsub:topic:example') // required, string with topic name
  .onMessage((message) => {}) // required, function message handler
  .onError((error) => {}) // optional, function error handler
  .listen()

// For ReqRes Pattern
bus
  .requester('reqres:topic:example') // required, string with topic name
  .withTimeout(3000) // optional, overwrite default timeout before error will fired
  .onResponse((response) => {}) // required, function response handler
  .onError((error) => {}) // optional, function error handler
  .request(payload)

bus
  .responder('reqres:topic:example')
  .onRequest((request) => {}) // required, function request handler
  .listen()

//* ******************************
// Examples
//* ******************************

// Will write all messages to strout and stop after 5 second
const listener = bus
  .subscriber('pubsub:topic:example')
  .onMessage(console.log)
  .listen()

setTimeout(() => listener.close(), 5000)

// Will send single message
bus.publisher('pubsub:topic:example')
  .publish({status: 'OK'})
  .then(() => console.log('Sended'))
  .catch((error) => console.error(error))

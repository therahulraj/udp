const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('emit', (message, callback) => {
    console.log(message);
    callback()
})

emitter.emit('emit', 'alf', () => {
    console.log('this is great')
    console.log('callback')
})
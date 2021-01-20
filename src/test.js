// const EventEmitter = require('events');

// const emitter = new EventEmitter();

// emitter.on('emit', (message, callback) => {
//     console.log(message);
//     callback()
// })

// emitter.emit('emit', 'alf', () => {
//     console.log('this is great')
//     console.log('callback')
// })
const express = require('express');
const HTTP_port = 80; //HTTP port no.
const app = express();

app.listen(HTTP_port, () => {
    console.log(`server is listening on port ${HTTP_port}`);
})
const path = require('path');
const net = require("net");
const http = require('http');

const express = require('express');
const socketIO= require('socket.io');

const EventEmitter = require('events');
const emitter = new EventEmitter();



let all_devices_value = ["0,0", "0,0", "0,0", "0,0"];



//***************************configuring TCP server***************************************************************
const TCP_port = 8080; //TCP port no.
const TCP_server = net.createServer() //TCP server created


//****************************configuring HTTP server**************************************************************
const HTTP_port = 80; //HTTP port no.
const app = express();
const HTTP_server = http.createServer(app);
const io = socketIO(HTTP_server);


//****************************serving the static web pages*********************************************************
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));





//********************************utils functions********************************************************************

function update_check_save_value(data) {
    single_device_value = data.split(",");
    let single_device_index = parseInt(single_device_value[0]);
    let single_device_state = parseInt(single_device_value[1]);
    let single_device_speed = parseInt(single_device_value[2]);
    if (single_device_value.length == 3) {
        if (single_device_index >= 0 && single_device_index <= all_devices_value.length) {
            if (single_device_state == 0 || single_device_state == 1) {
                if (single_device_speed >= 0 && single_device_speed <= 9) {
                    all_devices_value[single_device_index] = `${single_device_state},${single_device_speed}`;
                    console.log(single_device_value);
                    return true;
                }
            }
        }
    }
    return false;
}


//*****************************for HTTP web socket****************************************************************

io.on('connection', (HTTP_socket) => {

    HTTP_socket.emit('setupValue', all_devices_value.join(";"));

    function writeOnHTTPSocket(data) {
        HTTP_socket.emit('updatedValue', data)
    }

    emitter.on('valueChangedByTCP', writeOnHTTPSocket);

    HTTP_socket.on('updateValue', (data) => {

        if (update_check_save_value(data)) {
            emitter.emit('valueChangedByHTTP', data);
            io.emit('updatedValue', data);
        }

    })

    HTTP_socket.on('disconnect', () => {

        emitter.removeListener('valueChangedByTCP', writeOnHTTPSocket);

    })
    
})




// *************************************for TCP socket *********************************************************

TCP_server.on('connection', handleConnection);

function handleConnection(TCP_socket) {

    console.log(TCP_socket);

    let data_count = 0;

    function writeOnTCPSocket(data) {
        TCP_socket.write(data);
    }

    TCP_socket.write(all_devices_value.join(";"));


    emitter.on('valueChangedByHTTP', writeOnTCPSocket)



    emitter.on('valueChangedByTCP', writeOnTCPSocket);

        

    TCP_socket.on('data', onData)
    TCP_socket.on('close', onClose)
    TCP_socket.on('error', onError)

    function onData(data) {
        data = data.toString().trim();

        data_count++;

        console.log(data_count);
        if (update_check_save_value(data)) {
            emitter.emit('valueChangedByTCP', data);
        }
    }

    function onClose() {

        emitter.removeListener('valueChangedByHTTP', writeOnTCPSocket);

        emitter.removeListener('valueChangedByTCP', writeOnTCPSocket);

    }


    function onError(error) {
        
        console.log(error);

    }

}










TCP_server.listen(TCP_port, () => {
    console.log(`TCP server is up on ${TCP_port}`)
})


HTTP_server.listen(HTTP_port, () => {
    console.log(`HTTP server is up on ${HTTP_port}`)
})






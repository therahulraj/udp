const path = require('path');
const net = require("net");
const http = require('http');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketIO= require('socket.io');

let global_values = {
    color: 'white',
    range: '1'
}



//***********************configuring TCP server*************************************************************************
const TCP_port = 8080; //TCP port no.
const TCP_server = net.createServer() //TCP server created


//***********************configuring HTTP server***********************************************************************
const HTTP_port = 80; //HTTP port no.
const app = express();
const HTTP_server = http.createServer(app);
const io = socketIO(HTTP_server);


//****************************serving the static web pages*************************************************************
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath))
global_HTTP_socket = undefined;
global_TCP_socket = undefined;

function check_HTTP_connection () {
    io.on('connection', (HTTP_socket) => {
        global_HTTP_socket = HTTP_socket;
        io.emit('currentValues', global_values);
        HTTP_socket.on('updateColor', (color) => {
            global_values.color = color;
            if (global_TCP_socket) {
                global_TCP_socket.write(`${global_values.color} ${global_values.range}`)
            }
            console.log(global_values);
            io.emit('currentValues', global_values);
        })
        HTTP_socket.on('updateRange', (range) => {
            global_values.range = range;
            console.log(global_values);
            if (global_TCP_socket) {
                global_TCP_socket.write(`${global_values.color} ${global_values.range}`)
            }
            io.emit('currentValues', global_values);
        })
    })
}






function check_TCP_connection () {
    console.log('under TcP connection.')
    TCP_server.on('connection', handleConnection);

    function handleConnection(TCP_socket) {
        // console.log(socket)
        // console.log(socket.remotePort)
        // console.log(socket.clientIMEInumber)
        global_TCP_socket = TCP_socket;
        // TCP_socket.write("rahul");
        TCP_socket.on('data', onData)
        TCP_socket.on('close', onClose)
        TCP_socket.on('error', onError)

        function onData(data) {
            res_data = data.toString().trim();
            if (parseInt(res_data)) {
                global_values.range = parseInt(res_data).toString();
            } else {
                if (res_data == 'green' || res_data == 'white') {
                    global_values.color = res_data;
                }
            }
        global_TCP_socket.write(`${global_values.color} ${global_values.range}`)
        if (global_HTTP_socket) {
            io.emit('currentValues', global_values)
        }
        TCP_socket.write
        }
        function onClose() {
            console.log("one connection closed.")
        }
        function onError(error) {
            console.log(error)
        }
    }
}

    



check_HTTP_connection();
check_TCP_connection();





TCP_server.listen(TCP_port, () => {
    console.log(`TCP server is up on ${TCP_port}`)
})
HTTP_server.listen(HTTP_port, () => {
    console.log(`HTTP server is up on ${HTTP_port}`)
})






const path = require('path');
const net = require("net");
const http = require('http');
const EventEmitter = require('events');

const express = require('express');
const socketIO= require('socket.io');

require('./db/mongoose');
const Device = require('./models/device');
const {
    checkDeviceID,
    findDeviceByToken,
    writeOnHTTPSocket,
    writeOnTCPSocket
} = require('./utils/utils');
const userRouter = require('./routers/user')


const emitter = new EventEmitter();



let all_devices_value = ["0,0", "0,0", "0,0", "0,0"];



//***************************configuring TCP server***************************************************************
const TCP_port = 8080; //TCP port no.
const TCP_server = net.createServer()


//****************************configuring HTTP server**************************************************************
const HTTP_port = 80; //HTTP port no.
const app = express();
const HTTP_server = http.createServer(app);
const io = socketIO(HTTP_server);


//****************************serving the static web pages*********************************************************
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

app.use(express.json())
app.use(userRouter)





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


    HTTP_socket.on('join', (data, callback) => {
        findDeviceByToken(data.token).then(HTTP_device_id => {

            HTTP_socket.join(HTTP_device_id)

            callback()


            function writeOnHTTPSocket(TCP_data, TCP_device_id) {
                if (TCP_device_id == HTTP_device_id) {
                    io.to(TCP_device_id).emit('updatedValue', TCP_data)
                }
            }

            emitter.on('valueChangedByTCP', writeOnHTTPSocket);

            HTTP_socket.emit('setupValue', all_devices_value.join(";"));

            HTTP_socket.on('updateValue', (HTTP_data) => {
                if (update_check_save_value(HTTP_data)) {
                    console.log(HTTP_data)
                    emitter.emit('valueChangedByHTTP', HTTP_data, HTTP_device_id);
                    io.to(HTTP_device_id).emit('updatedValue', HTTP_data);
                }
            })

            HTTP_socket.on('disconnect', () => {
                emitter.removeListener('valueChangedByTCP', writeOnHTTPSocket);
            })

        }).catch(error => {
            console.log(error)
            callback(error)
        })



    })

})








// *************************************for TCP socket *********************************************************

TCP_server.on('connection', handleConnection);

function handleConnection(TCP_socket) {


    console.log(`connection - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)


    let TCP_device_id = undefined

    let TCP_data_count = 0;

    function writeOnTCPSocket(HTTP_TCP_data, HTTP_TCP_device_id) {
        if (HTTP_TCP_device_id == TCP_device_id) {
            TCP_socket.write(HTTP_TCP_data);
        }
    }

    emitter.on('valueChangedByHTTP', writeOnTCPSocket)

    emitter.on('valueChangedByTCP', writeOnTCPSocket)
    


        

    TCP_socket.on('data', onData)
    TCP_socket.on('close', onClose)
    TCP_socket.on('error', onError)


    function onData(TCP_data) {

        console.log(`data - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)
        
       
        

        TCP_data = TCP_data.toString().trim();

        

        console.log(TCP_data_count);

        if (TCP_data_count == 0) {

            checkDeviceID(TCP_data).then((deviceId) => {

                console.log(deviceId);

                TCP_device_id = deviceId

                TCP_socket.write(all_devices_value.join(";"));


            }).catch((error) => {

                TCP_socket.emit('error', new Error(error))

            })

            TCP_data_count++;

        } else {

            if (update_check_save_value(TCP_data)) {

                if (TCP_device_id) {

                    emitter.emit('valueChangedByTCP', TCP_data, TCP_device_id);

                }
                
            }

        }

        

        

        


    }

    function onClose() {

        emitter.removeListener('valueChangedByHTTP', writeOnTCPSocket);

        emitter.removeListener('valueChangedByTCP', writeOnTCPSocket);

        console.log(`close - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)

    }


    function onError(error) {

        console.log(error);
        
        console.log(`error - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)

        TCP_socket.destroy()

    }

}










TCP_server.listen(TCP_port, () => {
    console.log(`TCP server is up on ${TCP_port}`)
})


HTTP_server.listen(HTTP_port, () => {
    console.log(`HTTP server is up on ${HTTP_port}`)
})






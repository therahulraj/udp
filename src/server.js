const path = require('path');
const net = require("net");
const http = require('http');
const EventEmitter = require('events');

const express = require('express');
const socketIO= require('socket.io');

require('./db/mongoose');
const User = require('./models/user')
const {
    validateDeviceIdForTCPRegistration,
    validateDeviceState,
    updateDeviceState
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


//*****************************for HTTP web socket****************************************************************

io.on('connection', (HTTP_socket) => {


    HTTP_socket.on('join', async (data, callback) => {

        try {

            const user = await User.findByToken(data.token)

            const HTTP_device_id = user.deviceId

            HTTP_socket.join(HTTP_device_id)

            callback()

            async function writeOnHTTPSocket(TCP_data) {

                try {
    
                        HTTP_socket.emit('updatedValue', TCP_data)

                    } catch (error) {

                    console.log(error)
                    
                }

            }

            emitter.on(`TCP_data_listener_${HTTP_device_id}`, writeOnHTTPSocket);

            const { devices } = await User.findByDeviceId(HTTP_device_id)

            HTTP_socket.emit('setupValue', devices);

            HTTP_socket.on('updateValue', (HTTP_data, callback) => {

                try {

                    validateDeviceState(HTTP_data)

                    if (emitter.listenerCount(`HTTP_data_listener_${HTTP_device_id}`)) {
                        emitter.emit(`HTTP_data_listener_${HTTP_device_id}`, HTTP_data);
                        callback()

                    } else {
                        callback('Not able to send data to the device.')
                        HTTP_socket.emit('updatedValue', `0,${HTTP_data}`)
                    }

                } catch (error) {
                    console.log(error)
                    callback(error)
                }

            })

            HTTP_socket.on('disconnect', () => {
                emitter.removeListener(`TCP_data_listener_${HTTP_device_id}`, writeOnHTTPSocket);
            })

        } catch (error) {

            console.log(error)

        }
    
    })
})








//*************************************for TCP socket *********************************************************

TCP_server.on('connection', handleConnection);

function handleConnection(TCP_socket) {


    console.log(`connection - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)


    let TCP_device_id = undefined

    let TCP_data_count = 0;

    function writeOnTCPSocket(HTTP_data) {
            TCP_socket.write(HTTP_data);
    }

    TCP_socket.on('data', onData)
    TCP_socket.on('close', onClose)
    TCP_socket.on('error', onError)


    async function onData(TCP_data) {

        try {

            console.log(`data - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)
        
            TCP_data = TCP_data.toString().trim();
    
            console.log(TCP_data_count);
    
            if (TCP_data_count == 0) {
    
    
            TCP_device_id = await validateDeviceIdForTCPRegistration(TCP_data)

            TCP_socket.write(all_devices_value.join(";"));
    
            emitter.on(`HTTP_data_listener_${TCP_device_id}`, writeOnTCPSocket)
    
            TCP_data_count++;
    
            } else {
    
                if (TCP_device_id) {

                    validateDeviceState(TCP_data)

                    await updateDeviceState(TCP_device_id, TCP_data)

                    if (emitter.listenerCount(`TCP_data_listener_${TCP_device_id}`)) {

                        emitter.emit(`TCP_data_listener_${TCP_device_id}`, TCP_data);

                    }
                    
                }
    
            }        

        } catch (error) {
            TCP_socket.emit('error', new Error(error))
        }


    }

    function onClose() {

        emitter.removeListener(`HTTP_data_listener_${TCP_device_id}`, writeOnTCPSocket)

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






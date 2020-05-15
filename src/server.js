const path = require('path');
const net = require("net");
const http = require('http');
const EventEmitter = require('events');

const express = require('express');
const socketIO= require('socket.io');

require('./db/mongoose');
const User = require('./models/user')
const Device = require('./models/device')
const {
    validateDeviceState,
    updateNodeState,
    findDevicesAndNodesOfUser,
    addDevice,
    addNode
} = require('./utils/utils');
const userRouter = require('./routers/user')


const emitter = new EventEmitter();



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

            const user = await User.findByToken(data.token);
            const HTTP_user_id = user._id.toString();
            let devicesAndNodes = await findDevicesAndNodesOfUser(user);

            callback()

            async function writeOnHTTPSocket(TCP_data, TCP_device_id) {

                if (TCP_device_id) {

                    HTTP_socket.emit('updatedValue', TCP_data, TCP_device_id)
                    
                } else {

                    devicesAndNodes = TCP_data;
                    HTTP_socket.emit('setupValue', TCP_data);

                }

            } 

            if (user && HTTP_user_id && devicesAndNodes) {

                emitter.on(`TCP_data_listener_${HTTP_user_id}`, writeOnHTTPSocket);
            

                // const { devices } = await User.findByDeviceId(HTTP_device_id);
    
                HTTP_socket.emit('setupValue', devicesAndNodes);
    
                HTTP_socket.on('updateValue', async ({ node_state, node_device_id }, callback) => { 
    
                    try {
    
                        console.log(node_state, node_device_id);
    
                        const matchedDevice = devicesAndNodes.devices.find((device) => {
                            return device.deviceId === node_device_id
                        })
    
                        if (!matchedDevice) {
                            throw new Error('Invalid DeviceId')
                        }
    
                        validateDeviceState(node_state, matchedDevice.nodesCount)
    
                        if (emitter.listenerCount(`HTTP_data_listener_${node_device_id}`)) {
                            emitter.emit(`HTTP_data_listener_${node_device_id}`, node_state);
                            callback()
    
                        } else {
                            callback('Not able to send data to the device.');
                        }
    
                    } catch (error) {
    
                        console.log(error)
                        callback(error.message)
                    }
                })
    
    
                HTTP_socket.on('addDevice', async (addDeviceData, callback) => {
    
                    try {
    
                        await addDevice(addDeviceData, user)
    
                        devicesAndNodes = await findDevicesAndNodesOfUser(user);
    
                        emitter.emit(`TCP_data_listener_${HTTP_user_id}`, devicesAndNodes);
    
                        callback('new device added successfully')
    
    
                    } catch(error) {
    
                        console.log(error);
                        callback(error.message)
    
    
                    }
    
    
                })
    
                HTTP_socket.on('addNode', async (addNodeData, callback) => {
    
                    try {
    
                        await addNode(addNodeData, user);
    
                        devicesAndNodes = await findDevicesAndNodesOfUser(user);
    
                        emitter.emit(`TCP_data_listener_${HTTP_user_id}`, devicesAndNodes);
    
                        callback('new device added successfully')
    
                    } catch(error) {
    
                        console.log(error)
                        callback(error.message)
    
                    }
    
                })
    
    
    
                HTTP_socket.on('disconnect', () => {
                    emitter.removeListener(`TCP_data_listener_${HTTP_user_id}`, writeOnHTTPSocket);
                })

            } else {
                throw new Error('Invalid connection')
            }

        } catch (error) {

            callback(error.message)
            console.log(error)

        }
    
    })
})








//*************************************for TCP socket *********************************************************

TCP_server.on('connection', handleConnection);

function handleConnection(TCP_socket) {


    console.log(`connection - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)


    let TCP_user_id = undefined
    let TCP_device_id = undefined
    let device = undefined


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
    
            device = await Device.findById(TCP_data)

            if(!device.inUse) {
                throw new Error('Device not registered')
            }

            TCP_user_id = device.owner.toString();
            TCP_device_id = device.deviceId;


            // const { devices } = await User.findByDeviceId(TCP_data);

            // TCP_socket.write(devices.join(";"));

            if (device && TCP_user_id && TCP_device_id) {

                if (emitter.listenerCount(`HTTP_data_listener_${TCP_device_id}`) === 0) {

                    emitter.on(`HTTP_data_listener_${TCP_device_id}`, writeOnTCPSocket);
                    TCP_data_count++;

                } else {
                    throw new Error('DeviceId already connected')
                }

            } else {
                throw new Error('Invalid DeviceId')
            }
    
            
    
            } else {
    
                if (device && TCP_user_id && TCP_device_id) {

                    validateDeviceState(TCP_data, device.nodesCount);

                    await updateNodeState(TCP_data, TCP_device_id)

                    if (emitter.listenerCount(`TCP_data_listener_${TCP_user_id}`)) {

                        emitter.emit(`TCP_data_listener_${TCP_user_id}`, TCP_data, TCP_device_id);

                    }

                    // await updateDeviceState(TCP_device_id, TCP_data)
                    
                }
    
            }        

        } catch (error) {
            TCP_socket.emit('error', new Error(error))
        }


    }

    function onClose() {

        emitter.removeListener(`HTTP_data_listener_${TCP_device_id}`, writeOnTCPSocket);

        console.log(`close - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)

    }


    function onError(error) {

        emitter.removeListener(`HTTP_data_listener_${TCP_device_id}`, writeOnTCPSocket);

        TCP_socket.destroy();

        console.log(error);
        
        console.log(`error - ${TCP_socket.remoteAddress} - ${TCP_socket.remotePort} - ${TCP_socket.remoteFamily}`)

    }

}



TCP_server.listen(TCP_port, () => {
    console.log(`TCP server is up on ${TCP_port}`)
})


HTTP_server.listen(HTTP_port, () => {
    console.log(`HTTP server is up on ${HTTP_port}`)
})






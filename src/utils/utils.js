const Device = require('../models/device')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Node = require('../models/node')


function validateDeviceState(deviceState) {
    deviceState = deviceState.split(",")
    const deviceStateLength = deviceState.length;
    
    const index = parseInt(deviceState[0])
    const state = parseInt(deviceState[1])
    const speed = parseInt(deviceState[2])

    if (deviceStateLength == 3) {
        if (index >= 0 && index <= 3) {
            if (state == 0 || state == 1) {
                if (speed >= 0 && speed <= 10) {
                    if (speed == 0 && state == 1) {
                    	throw new Error('Invalid state of Device')
                    }
                    if (speed != 0 && state == 0) {
                    	throw new Error('Invalid state of Device')
                    }
                    else {
                    return true
                    }
                } else {
                throw new Error('Device Speed out of Range')
                }
                
            } else {
            	throw new Error("Not able to identify on off state of the Device")
            }
            
        }
        else {
        	throw new Error("No such Device found")
        }
        
    }
    else {
    	throw new Error("Invalid data provided")
    }
    
}

async function findDevicesAndNodesOfUser(user) {
    await user.populate('devices').execPopulate()
    await user.populate('nodes').execPopulate()
    return {
        devices: user.devices,
        nodes: user.nodes
    }
}


async function addDevice(addDeviceData, user) {

        const device = await Device.findByDeviceId(addDeviceData.deviceId)

        if (device.inUse) {
            throw new Error('Invalid DeviceId')
        }

        await user.populate('devices').execPopulate()

        console.log(addDeviceData)

        device.inUse = true
        device.owner = user._id;
        device.deviceName = addDeviceData.deviceName.trim().toLowerCase()
        device.placeName = addDeviceData.placeName.trim().toLowerCase()

        //validating data before comparing.
        if (!(device.deviceName && device.placeName)) {
            throw new Error('Invalid Device data')
        }
        if (!(device.deviceName.length > 1 && device.placeName.length > 1)) {
            throw new Error('Invalid Device data')
        }


        const deviceName = device.deviceName
        const placeName = device.placeName
        let noSameName = true


        const filteredSamePlaceName = user.devices.filter((device) => {
            return device.placeName === placeName
        })

        if (filteredSamePlaceName.length > 0) {
            noSameName = filteredSamePlaceName.every((node) => {
                return node.deviceName !== deviceName
            })
        }

        if (!noSameName) {
            throw new Error('Cannot have two Devices with same name')
        }

        await device.save()

}


async function addNode(addNodeData, user) {

    const device = await Device.findByDeviceId(addNodeData.deviceId)

        if (!device.inUse) {
            throw new Error('Invalid DeviceId')
        }

        if (device.owner.toString() !== user._id.toString()) {
            throw new Error('Invalid DeviceId');
        }

        const placeName = device.placeName
        const deviceName = device.deviceName


        const node = new Node({
            ...addNodeData,
            placeName,
            deviceName,
            state: 0,
            speed: 0,
            owner: user._id
        })

        await node.validate()

        const index = parseInt(addNodeData.index, 10)
        const roomName = addNodeData.roomName.trim().toLowerCase()
        const nodeName = addNodeData.nodeName.trim().toLowerCase()
        

        if (index > device.nodesCount || index < 0) {
            throw new Error('Invalid Node Index')
        }

        await user.populate('nodes').execPopulate()
        console.log(user.nodes)

        let validIndex = true
        let validNodeName = true

        const validIndexAndNodeName = user.nodes.every((node) => {

            validIndex = !(addNodeData.deviceId === node.deviceId && index === node.index);
            validNodeName = !(placeName === node.placeName && nodeName === node.nodeName && roomName === node.roomName);
            return validIndex && validNodeName;
            
        });
        

        if (!validIndexAndNodeName) {
            if (!validIndex) {
                throw new Error('Invalid index value');
            }
            if(!validNodeName) {
                throw new Error('Cannot have Items with same name in a room.')
            }
        }

        await node.save()

}

async function updateNodeState(TCP_data, deviceId) {

    TCP_data = TCP_data.split(",")
    const index = parseInt(TCP_data[0])
    const state = parseInt(TCP_data[1])
    const speed = parseInt(TCP_data[2])
    const node = await Node.findOne({deviceId, index})
    if (node) {
        node.state = state;
        node.speed = speed;
    }
    await node.save()
}


 module.exports = {
    validateDeviceState,
    updateNodeState,
    findDevicesAndNodesOfUser,
    addDevice,
    addNode
 }
const Device = require('../models/device')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


function validateDeviceState(deviceState) {
    deviceState = deviceState.split(",")
    const deviceStateLength = deviceState.length;
    
    const index = parseInt(deviceState[0])
    const state = parseInt(deviceState[1])
    const speed = parseInt(deviceState[2])

    if (deviceStateLength == 3) {
        if (index >= 0 && index <= 3) {
            if (state == 0 || state == 1) {
                if (speed >= 0 && speed <= 5) {
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




async function validateDeviceIdForTCPRegistration(deviceId) {
                    
    const device = await Device.findByDeviceId(deviceId)
    
    if (!device.used) {
        throw new Error('Device not registered')
    }

    return device.deviceId
 
}

//done
async function updateDeviceState(deviceId, deviceState) {

    const user = await User.findByDeviceId(deviceId)

    deviceState = deviceState.split(',')

    const deviceIndex = parseInt(deviceState[0])

    let devices = user.devices

    let eachDeviceIndex = undefined

    let prevDeviceState = devices.find((eachDevice, index) => {
        eachDeviceIndex = index
        return eachDevice.index == deviceIndex
    })


    if (prevDeviceState) {
        devices.splice(eachDeviceIndex, 1, {
            index: deviceIndex,
            state: parseInt(deviceState[1]),
            speed: parseInt(deviceState[2])
        })
    } else {
        devices.push({
            index: deviceIndex,
            state: parseInt(deviceState[1]),
            speed: parseInt(deviceState[2])
        })
    }


    user.devices = devices

    await user.save()

    
}




 module.exports = {
    validateDeviceIdForTCPRegistration,
    validateDeviceState,
    updateDeviceState
 }
const Device = require('../models/device')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


async function findDeviceByToken(token) {
    
        const decoded = jwt.verify(token, 'secret')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        await user.populate('deviceId').execPopulate()
        // console.log(user.deviceId)
        return user.deviceId.deviceId
    
}

async function checkDeviceID(device_id) {
                    
    const device = await Device.findDevice(device_id)
    
    if (!device.used) {
        throw new Error('Device not registered')
    }

    return device.deviceId
 
}

function writeOnHTTPSocket(io, TCP_data, TCP_device_id) {
    if (TCP_device_id == HTTP_device_id) {
        io.to(TCP_device_id).emit('updatedValue', TCP_data)
    }
}

 module.exports = {
     checkDeviceID,
     findDeviceByToken,
     writeOnHTTPSocket
 }
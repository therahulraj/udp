const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, 
    used: {
        type: Boolean,
        required: true,
        default: false
    }
})

deviceSchema.statics.findDevice = async (deviceId) => {

    const device = await Device.findOne({ deviceId })

    if (!device) {
        throw new Error('Cannot find device')
    }

    return device

}

deviceSchema.methods.changeDeviceState = async function() {

    const device = this

    if (!device.used) {
        device.used = true
    }

    await device.save()


}



const Device = mongoose.model('Device', deviceSchema)

module.exports = Device
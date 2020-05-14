const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    }, 
    inUse: {
        type: Boolean,
        required: true,
        default: false
    },
    nodesCount: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deviceName: {
        type: String,
        lowercase: true,
        trim: true,
        minlength: 2
    },
    placeName: {
        type: String,
        trim: true,
        lowercase: true,
        minlength: 2
    }
}, {
    timestamps: true
})

deviceSchema.statics.findByDeviceId = async (deviceId) => {

    const device = await Device.findOne({ deviceId })

    if (!device) {
        throw new Error('Invalid DeviceId')
    }

    return device

}

deviceSchema.statics.findById = async (id) => {

    const device = await Device.findOne({ id })

    if (!device) {
        throw new Error('Invalid Id')
    }

    return device

}

deviceSchema.methods.toJSON = function () {
    const device = this
    const deviceObject = device.toObject()

    delete deviceObject.id
    delete deviceObject.owner
    delete deviceObject.inUse

    return deviceObject

}


const Device = mongoose.model('Device', deviceSchema)

module.exports = Device
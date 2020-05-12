const mongoose = require('mongoose');


const nodeSchema = new mongoose.Schema({
        deviceId: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        deviceName: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
            minlength: 2
        },
        placeName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            minlength: 2
        },
        roomName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            lowercase: true
        },
        nodeName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            lowercase: true
        },
        index: {
            type: Number,
            required: true
        }, 
        state: {
            type: Number,
            required: true,
            validate(value) {
                if (value != 0 && value != 1) {
                        throw new Error("invalid state of the Device")
                    
                }
            }
        }, 
        speed: {
            type: Number,
            required: true,
            validate(value) {
                if (value < 0 || value > 10) {
                    throw new Error("speed of the Device out of range")
                }
            }
        }
}, {
    timestamps: true
})

nodeSchema.statics.findByDeviceId = async (deviceId) => {

    // console.log(deviceId)

    const node = await Node.findOne({ deviceId })

    if (!node) {
        throw new Error('Cannot find Device')
    }

    return node

}

// nodeSchema.methods.toJSON = function () {
//     const node = this;
//     const nodeObject = node.toObject()

//     delete nodeObject._id
//     delete nodeObject.__v
//     delete nodeObject.owner

//     return nodeObject
// }

const Node = mongoose.model('Node', nodeSchema);

module.exports = Node
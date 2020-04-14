const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    deviceId: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
    },
    devices: [{
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
                if (value < 0 || value > 5) {
                    throw new Error("speed of the Device out of range")
                }
            }
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})



userSchema.methods.generateAuthToken = async function() {

    const user = this

    const token = jwt.sign({ _id: user._id.toString() }, 'secret')

    return token

}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('user not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('password is invalid')
    }

    return user

}

userSchema.statics.findByToken = async function (token) {
    
    const decoded = jwt.verify(token, 'secret')

    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    return user

}

userSchema.statics.findByDeviceId = async (deviceId) => {

    const user = await User.findOne({ deviceId })

    if (!user) {
        throw new Error('user not found')
    }

    return user

}


userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()

})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.deviceId
    delete userObject.__v
    delete userObject._id

    return userObject
}

const User = mongoose.model('User', userSchema)

module.exports = User
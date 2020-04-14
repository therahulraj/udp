const express = require('express');
const User = require('../models/user');
const Device = require('../models/device')

const router = new express.Router();


router.post('/api/user-register', async (req, res) => {

    const user = new User(req.body)
    
    try {

        const device = await Device.findByDeviceId(req.body.deviceId)

        if (device.used) {
            throw new Error('Device already registered')
        }

        const token = await user.generateAuthToken()

        user.tokens = user.tokens.concat({ token })

        await user.save()

        await device.changeUsedState()

        res.status(201).send({user, token})

    } catch (error) {

        console.log(error)
        res.status(400).send(error.message)

    }
})

router.post('/api/user-login', async (req, res) => {

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()

        user.tokens = user.tokens.concat({ token })

        await user.save()

        res.status(200).send({ user, token })

    } catch(error) {
        console.log(error)
        res.status(400).send(error.message)
    }
    
    

})

module.exports = router;
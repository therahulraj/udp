const express = require('express');
const User = require('../models/user');
const Device = require('../models/device')
const Node = require('../models/node')
const auth = require('../middleware/auth');
const {
    findDeviceIdsByToken
} = require('../utils/utils')

const router = new express.Router();


router.post('/api/user-register', async (req, res) => {

    const user = new User(req.body)
    
    try {

        const token = await user.generateAuthToken()

        user.tokens = user.tokens.concat({ token })

        await user.save()

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

router.post('/api/add-new-device', auth, async (req, res) => {

    try {

        const device = await Device.findByDeviceId(req.body.deviceId)

        if (device.inUse) {
            throw new Error('Invalid DeviceId')
        }

        await req.user.populate('devices').execPopulate()

        console.log(req.user.devices)

        device.inUse = true
        device.owner = req.user._id
        device.deviceName = req.body.deviceName.trim().toLowerCase()
        device.placeName = req.body.placeName.trim().toLowerCase()

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


        const filteredSamePlaceName = req.user.devices.filter((device) => {
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

        res.status(201).send(device)

    } catch(error) {

        console.log(error)
        res.status(400).send(error.message)

    }

})

router.post('/api/add-new-node', auth, async (req, res) => {

    try {

        const device = await Device.findByDeviceId(req.body.deviceId)

        if (!device.inUse) {
            throw new Error('Invalid DeviceId')
        }

        if (device.owner.toString() !== req.user._id.toString()) {
            throw new Error('Invalid DeviceId');
        }

        const placeName = device.placeName
        const deviceName = device.deviceName


        const node = new Node({
            ...req.body,
            placeName,
            deviceName,
            state: 0,
            speed: 0,
            owner: req.user._id
        })

        await node.validate()

        const index = parseInt(req.body.index, 10)
        const roomName = req.body.roomName.trim().toLowerCase()
        const nodeName = req.body.nodeName.trim().toLowerCase()
        

        if (index > device.nodesCount || index < 0) {
            throw new Error('Invalid Node Index')
        }

        await req.user.populate('nodes').execPopulate()
        console.log(req.user.nodes)

        let validIndex = true
        let validNodeName = true

        const validIndexAndNodeName = req.user.nodes.every((node) => {

            validIndex = !(req.body.deviceId === node.deviceId && index === node.index);
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

        res.status(201).send(node)

    } catch(error) {

        console.log(error)
        res.status(400).send(error.message)
    }

})

module.exports = router;
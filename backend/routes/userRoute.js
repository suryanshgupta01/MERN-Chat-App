const express = require('express')
const USER = require('../models/userModel')
const router = express.Router()
const genToken = require('../config/genToken')
const jwt = require('jsonwebtoken')
const authoriseuser = require('../middleware/authoriseuser')




router.get('/', authoriseuser, async (req, res) => {
    //fetch all data
    try {
        const data = await USER.find().select('-password').sort({ "name": 1 })
        res.send(data)
    } catch (error) {
        console.log(`Error in fetching users3 ${error}`)
    }
})



router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await USER.findOne({ email })
    if (!user) {
        res.send({ "msg": 'User not found' })

    }
    if (user && (await user.comparePass(password))) {
        res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            token: genToken(user._id),
        })
    }
    else {
        return res.send({ 'msg': 'Invalid credentials' })
    }
})
router.post('/register', async (req, res) => {
    try {
        const { email } = req.body
        const user1 = await USER.findOne({ email })
        if (user1) {
            res.send({ "msg": 'User Already Exists' })
            return
        }
        const user = new USER(req.body)
        // user.register()
        await user.save()
        res.send({
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            token: genToken(user._id),
            _id: user._id
        })
    } catch (error) {
        res.json({ 'msg': 'Email already exists' })
    }

})
module.exports = router
const express = require('express')
const USER = require('../models/userModel')
const router = express.Router()
const genToken = require('../config/genToken')
const jwt = require('jsonwebtoken')
router.get('/', async (req, res) => {
    //fetch all data
    try {
        const data = await USER.find().select('-password').sort({ "name": 1 })
        res.send(data)
    } catch (error) {
        console.log(`Error in fetching users3 ${error}`)
    }
})

async function authoriseuser(req, res, next) {
    jwt.verify(req.body.token, process.env.JWT_SECRET, (err, user) =>
        req.user = user
    )
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await USER.findOne({ email })
    if (user && (await user.comparePass(password))) {
        res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            // token: genToken(user._id),
        })
    }
    else {
        return res.status(503).json({ 'msg': 'Invalid credentials' })
    }
})
router.post('/register', async (req, res) => {
    try {
        const user = new USER(req.body)
        // user.register()
        await user.save()
        res.send({
            name: user.name,
            email: user.email,
            profilePic: user.pic,
            // password: user.password,
            token: genToken(user._id),
            _id: user._id
        })
    } catch (error) {
        res.status(422).json({ 'message': 'Email already exists' })
    }

})
module.exports = router
const express = require('express')
const mongoose = require('mongoose')
const CHAT = require('../models/chatModel')
const router = express.Router()
const authoriseuser = require('../middleware/authoriseuser')
require("dotenv").config()


router.get('/', authoriseuser, async (req, res) => {
    //fetch all data
    try {

        // const OBJID = req.params.id
        const OBJID = req.user.id
        // console.log("objid", OBJID)
        const data = await CHAT.find().populate(["conversation", "people", "latestmessage"]).sort({ latestmessage: -1 })
        const result = data.filter((ele) => {
            return (ele.people[0]._id.toString() === OBJID || ele.people[1]._id.toString() === OBJID)
        })
        res.send(result)

    } catch (error) {
        console.log(`Error in fetching users2 ${error}`)

    }

})

// router.get('/selectedchat/:id', async (req, res) => {
//     try {
//         const OBJID = req.params.id
//         const data = await CHAT.find().populate(["conversation", "people", "latestmessage"])
//         const result = data.filter((ele) => {
//             return (ele.people[0]._id.toString() === OBJID || ele.people[1]._id.toString() === OBJID)
//         })
//         res.send(data)
//     } catch (error) {
//         console.log(`Error in fetching users ${error}`)
//     }
// })

//NOT USED IN THIS PROJECT
router.get('/selectchat/:id', async (req, res) => {
    try {
        const ID = req.params.id
        const data = await CHAT.findOne({ _id: ID }).populate(["conversation", "people"])
        data.isselected = !data.isselected;
        data.save()
        res.send(data)

    } catch (error) {
        //res send
        res.status(400).send({ msg: "id not foud" })
        console.log(`Error in fetching users ${error}`)
    }

})

router.post('/create', authoriseuser, async (req, res) => {
    // console.log(req.body)
    // const ID = req.user.id
    const already = await CHAT.findOne({ people: [req.body.people[0], req.body.people[1]] })
    const already2 = await CHAT.findOne({ people: [req.body.people[1], req.body.people[0]] })
    // console.log(already)
    // console.log(already2)
    if (already || already2) {
        // console.log("user already selected")
        return;
    }
    // console.log("still ran")
    const newmsg = new CHAT(req.body)
    newmsg.save()
    res.send(newmsg)
})

router.delete('/delete/:id', authoriseuser, async (req, res) => {
    const ID = req.params.id
    try {
        const deleted = await CHAT.findOneAndDelete({ _id: ID })
        res.send(deleted)
    } catch (error) {
        console.log(`Error in deleting users ${error}`)
    }

})
router.put('/addmsg/:id', async (req, res) => {
    // console.log(req.body)
    const updated = await CHAT.findOneAndUpdate({ _id: req.params.id }, {
        $push: {
            conversation: req.body.latestmessage
        },
        latestmessage: req.body.latestmessage
    },
        { new: true }
    )
    res.send(updated)
})

module.exports = router

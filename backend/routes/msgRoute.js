const express = require('express')
const router = express.Router()
const MSG = require('../models/msgModel')
// router.get('/', (req, res) => {
//     res.send({ msg: `msg api runing` })
// })

router.get('/:id', async (req, res) => {
    //fetch all data
    try {
        const OBJID = req.params.id
        const data = await MSG.find().populate(["sender", "reciever"])
        const result = data.filter((ele) => {
            const recieverId = ele.reciever && ele.reciever._id && ele.reciever._id.toString();
            const senderId = ele.sender && ele.sender._id && ele.sender._id.toString();
            return (recieverId === OBJID || senderId === OBJID)

            // else console.log("false")
            // console.log(typeof (ele.reciever._id.toString()))
            // return ele
            // console.log(ele)
            // return (ele.reciever._id.toString() === OBJID || ele.sender._id.toString() === OBJID)
        })
        res.send(result)
    } catch (error) {
        console.log(`Error in fetching users1 ${error}`)
    }
})
router.post('/create', async (req, res) => {
    const newmsg = new MSG(req.body)
    newmsg.save()
    res.send(newmsg)
})
//route for deleting msg with id
router.delete('/delete/:id', async (req, res) => {
    try {
        const ID = req.params.id
        const data = await MSG.findByIdAndDelete({ _id: ID })
        // data.remove()
        res.send({"msg":"deleted successfully"})
    } catch (error) {
        //res send
        res.status(400).send({ msg: "id not foud" })
        console.log(`Error in fetching users ${error}`)
    }
})

module.exports = router
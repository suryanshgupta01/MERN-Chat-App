const mongoose = require('mongoose')

const chatModel = mongoose.Schema(
    {
        conversation: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "MSG"
        }],
        people: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        }],
        isselected: {
            type: Boolean,
            default: false
        },
        latestmessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MSG"
        },
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model("CHAT", chatModel)
module.exports = Chat
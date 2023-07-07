const mongoose = require('mongoose')

const msgModel = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        },
        content: {
            type: String,
            trim: true
        },
        reciever: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        }
    },
    {
        timestamps: true
    }
)

const Msg = mongoose.model("MSG", msgModel)
module.exports = Msg
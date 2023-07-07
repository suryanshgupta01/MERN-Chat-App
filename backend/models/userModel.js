const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userModel = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        }
    },
    {
        timestamps: true
    }
)

userModel.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(this.password, salt);
    this.password = hashedpass

})


userModel.methods.comparePass = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("USER", userModel)
module.exports = User
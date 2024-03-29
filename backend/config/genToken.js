const jwt = require('jsonwebtoken')

const genToken = (id) => {
    // console.log(id)
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '90d' })
}

module.exports = genToken

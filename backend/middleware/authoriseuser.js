const jwt = require('jsonwebtoken')

async function authoriseuser(req, res, next) {
    // console.log(req.headers)
    const TOKEN1 = req.headers.authorization
    if (!TOKEN1) {
        return res.status(403).json({ msg: 'Valid token required' });
    }
    const TOKEN = TOKEN1.replace('Bearer ', '')
    jwt.verify(TOKEN, process.env.JWT_SECRET, (err, user) => {
        if (err) res.status(403).send({ "msg": "invalid token" })
        req.user = user
        next();
    })
}
module.exports = authoriseuser

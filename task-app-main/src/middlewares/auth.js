// Import Libs
const jwt = require('jsonwebtoken') // For Token validation

// Import Models
const User = require('../models/user')
const auth = async (req, res, next) => {
    try {  
        const token = req.cookies['token']
        const decoded = jwt.verify(token, process.env.JWT_SECRET) 
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if(!user) {
            throw new Error() 
        }

        req.token = token

        req.user = user
        next()

    } catch (error) {
        res.status(401).render('index',{ 
            error,
            display: 'display:block;',
            title: 'Stack App',
            name: 'sumit', 
        }) 
    }
}
module.exports = auth
const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL_DB 

mongoose.connect(connectionURL, {})


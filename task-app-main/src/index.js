const express = require('express') 
var cookieParser = require('cookie-parser') // for parsing cookie data in front end
const path = require('path') // Node.js built-in lib, work w/ dirs
const bodyParser = require('body-parser') // For parsing html requests
const methodOverride = require('method-override') // Allows HTML forms to process PATCH/DELETE requests
const hbs = require('hbs') // For dinamic html templating

require('./db/mongoose')

const publicFolder = path.join(__dirname,'../public/')
const viewsPath = path.join(__dirname, '../views/views') // Define `views` folder path
const partialsPath = path.join(__dirname, '../views/partials') // Define `partials` folder path

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const frontRouter = require('./routers/frontend')

const app = express()
const port = process.env.PORT// Define port for heroku or local dev
app.set('view engine', 'hbs')


app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
hbs.registerHelper("prettifyDate", function(timestamp) {
    const date = timestamp.toString().substring(0,21)
    return date
});

hbs.registerHelper("checkTasksArray", function(data) {
    if (data.length == 1) {
        var string = "class='col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6'" 
        return string
    } else {
        var string = "class='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12'"
        return string
    }
});

app.use(express.static(publicFolder))
console.log(publicFolder)
app.use(express.json())


app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(methodOverride('_method'))


app.use(userRouter)
app.use(taskRouter)
app.use(frontRouter)

app.listen(port, () => {
    console.log('Server is up on port ', port)
})


const express = require('express') // Define Router
const multer = require('multer') // Upload files via App Endpoints
const sharp = require('sharp')// Convert large images to smaller
const path = require('path') // Nodejs built-in lib, enables to work with dirs
const bodyParser = require('body-parser')

const User = require('../models/user')

const { sendWelcomeEmail, sendFarewellEmail } = require('../emails/account')

const auth = require('../middlewares/auth')

const jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const router = new express.Router()


router.post('/users', jsonParser, async (req,res) => {
    console.log(req.body)
    // Define user object as User model
    const user = new User(req.body)

    // Save in MongoDB
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name) // Send Welcome Email
        const token = await user.genToken() // Generate User token
        res.cookie('token', token)
        res.render('private', { 
            user,
            title: 'Home' 
        })
    } catch (error) {
        res.status(400).render('register', { // send an object with essencial information
            title: 'Register',
            name: 'joaohb07',
            display: 'display:block;',
            error
        }) // 400 - Bad Request, send error
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user) // Send current user authenticated
})

// Find User by id Endpoint
router.get('/users/:id', async (req,res) => {
    const _id = req.params.id

    try {
        // Await User find by id
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send({ user: 'Not Found!' }) // 404 - Not Found, Send User not found
        }
        
        res.send(user) // 200 - OK (pattern), Send retrieved User Object

    } catch(error) {
        res.status(500).send(error) // 500 - Internal Server Error, Send Service Down
    }
})

router.patch('/users/me', auth, async (req,res) => { 
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'email', 'age']
    const isValidOperation = updates.every((update) => {return allowedUpdates.includes(update)})

    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid User Update!" }) // 400 - Bad Request, Invalid Update
    }

    try {
        updates.forEach((update) => {req.user[update] = req.body[update]})
        await req.user.save()
        
        res.render('user', { 
            user: req.user,
            title: 'User Details' 
        }) 

    } catch (error) {
        res.status(500).send(error) // 400 - Internal Server Error, Invalid Update
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove() 

        sendFarewellEmail(req.user.email, req.user.name) // Send Farewell email

        res.render('index', { // send an object with essencial information
            title: 'Task App',
            message: 'Successfully Deleted, Good Bye ' + req.user.name + '!',
            name: 'sumit',
            display: 'display:none;'
        }) 
    } catch (error) {
        res.status(500).send(error) // 500 - Internal Server Error, Send Service Down
    }
})

router.post('/users/login', urlencodedParser, async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.genToken()
        res.cookie('token', token) 
        res.render('private', { 
            user,
            token,
            title: 'Home' 
        })
    } catch (error) {
        res.status(400).render('index', { // send an object with essencial information
            title: 'task App',
            name: 'sumit',
            display: 'display:block;',
            error
        }) // 400 - Bad Request, Cannot Authenticate User
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token 
        })

        // Save user after the operation
        await req.user.save()

        res.render('index', { // send an object with essencial information
            title: 'Task App',
            message: 'Successfully Logged Out,' + req.user.name,
            name: 'sumit',
            display: 'display:none;'
        }) // 200 - OK, Successfuly log out
    } catch (error) {
        res.status(500).send() // 500 - Internal Server Error, Impossible to LogOut
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // Set User tokens array from request as an empty Array 
        req.user.tokens = []

        // Save User after the operation
        await req.user.save()

        // res.send() // 200 - OK, Successfuly log out
        res.render('index', { // send an object with essencial information
            title: 'Task App',
            message: 'Successfully Logged Out from all sessions,' + req.user.name,
            name: 'sumit',
            display: 'display:none;'
        })
    } catch (error) {
        res.status(500).send() // 500 - Internal Server Error, Impossible to LogOut from All User Sessions
    }
})
const upload = multer({
    limits: {
        fileSize: 1000000 // Bytes, set file size up to 1 MB large
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)) { // /\.(files|extension)$/
            callback(new Error('File must be an image')) // Send Error
        }

        callback(undefined, true) // Accept upload

    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    if (!req.file) {
        return res.status(400).render('user', { 
            user: req.user,
            title: 'User Details' 
        })
    }
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    req.user.avatar = buffer // binary data from user img file

    // Save user
    await req.user.save()

    res.render('user', { 
        user: req.user,
        title: 'User Details' 
    }) // 200 - OK (pattern), Image Uploaded
}, (error, req, res, next) => { // Handle Express error
    res.status(400).send({error: error.message}) // 400 - Bad Request, File Rejected
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined // set user avatar as undefined

    // Save user
    await req.user.save()

    res.render('user', { 
        user: req.user,
        title: 'User Details' 
    }) // 200 - OK (pattern), Image deleted
})

router.get('/users/me/avatar', auth, async (req, res) => {
    try {

        const avatar = req.user.avatar

        if(!avatar || avatar === ""){
            return res.status(404).send() // 404 - Not Found, Image Not Found
        }

        res.set('Content-Type', 'image/png')

        res.send(avatar)
    } catch (error) {
        res.status(500).send() // 404 - Internal Server Error, Impossible to fetch avatar
    }
})

module.exports = router
const express = require('express')
const bodyParser = require('body-parser')

const User = require('../models/user')

const auth = require('../middlewares/auth')

const jsonParser = bodyParser.json()

var urlencodedParser = bodyParser.urlencoded({ extended: false })

const router = new express.Router()


router.get('/', (req,res) => {
    res.render('index', { 
        title: 'Task App',
        name: 'sumit',
        display: 'display:none;'
    }) 
})


router.get('/register', (req,res) => {
    res.render('register', { 
        title: 'Register',
        name: 'sumit',
        display: 'display:none;'
    }) 
})


router.get('/private', auth, async (req, res) => {
    try {
        res.render('private', { 
            user: req.user,
            title: 'Home' 
        })
    } catch (error) {
        res.status(404).send()
    }
})

router.get('/createtask', auth, async (req, res) => {
    try {
        res.render('createtask', { 
            user: req.user,
            title: 'Create Task',
            display: 'display: none;'  
        })
    } catch (error) {
        res.status(404).send() 
    }
})


router.get('/viewtask', auth, async (req, res) => {
    try {
        res.render('tasks', { 
            user: req.user,
            title: 'View Tasks',
            display: 'display: none;'  
        })
    } catch (error) {
        res.status(404).send() 
    }
})

router.get('/userpage', auth, async (req, res) => {
    try {
        res.render('user', { 
            user: req.user,
            title: 'User Details' 
        })
    } catch (error) {
        res.status(404).send() 
    }
})

module.exports = router
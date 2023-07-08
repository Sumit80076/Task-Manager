
const express = require('express')

const Task = require('../models/task')

const auth = require('../middlewares/auth')
const paginate = require('../middlewares/paginate')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body, // copy body request to task object
        author: req.user._id // With auth middleware, we can fecth user id of our authenticated user
    })

    // Save in MongoDB
    try {
        await task.save()
        res.status(201).render('createtask', { 
            user: req.user,
            title: 'View Tasks',
            task,
            action: 'Created',
            display: "display: block;" 
        })
    } catch(error) {
        res.status(400).render('private', { 
            user: req.user,
            token: req.token,
            title: error
        })
    }
})

router.get('/tasks', auth, async (req,res) => {

    const sort = {}

    const match = { // always will include author for validation
        author: req.user._id // req.user provided by authentication
    }

    if (req.query.completed) { // url/tasks?completed=true || false
        match.completed = req.query.completed === 'true' // Add completed passed to match object
    }
    if (req.query.sortBy) { // url/tasks?sortBy=completed||createdAt||updatedAt:desc(for descending order)||asc(for ascending order)
       const parts = req.query.sortBy.split(':') // divide value, orde
       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1// first part - value, second part - order
    }
    const limit = 4
    var count = 0
    var pages = [1]


    try {

        const tasks = await Task.find(match)

        for(task in tasks) {
            count++
            if (count % 4 == 0){
                pages.push(pages.length + 1)
            }
        }

        // console.log(pages)

        var skip = (req.query.page - 1) * limit
        const tasks_selected = await Task.find(match, null, { // find options
            skip: skip, // skip (for pagination), only if set as query param in the request
            limit: limit, // limit (for pagination), only if set as query param in the request
            sort
        }) // match object to find specified data

        res.render('tasks',{
            user: req.user,
            title: 'View Tasks',
            display: 'display: none;', 
            tasks: tasks_selected,
            pages,
            completed: match.completed
        }) // 200 - OK (pattern), Send retrieved Tasks Object
    } catch(error) {
        res.status(500).send(error) // 500 - Internal Server Error, Send Service Down
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, author: req.user._id})

        if(!task){
            return res.status(404).send({ task: "Not Found!" }) // 404 - Not Found, Send User not found
        }
        res.send(task) // 200 - OK (pattern), Send retrieved User Object
    } catch (error) {
        res.status(500).send(error) // 500 - Internal Server Error, Send Service Down
    }
})

router.patch('/tasks/:id', auth, async (req,res) => { 
    const updates = Object.keys(req.body)

    console.log("Body " + Object.values(req.body))

    // Define allowed Updates Array
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update) => {return allowedUpdates.includes(update)})
 
    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid Task Update!" }) // 400 - Bad Request, Invalid Update
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, author: req.user._id })
        

        if(!task) {
            return res.status(404).send() // 404 - Not Found, Send User not found
        }


        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        console.log("Tasks again " + task)

        res.render('tasks', { 
            title: 'View Tasks',
            task,
            action: 'Updated',
            display: "display: block;" 
        }) // 200 - OK (pattern), Task updated

    } catch (error) {
        res.status(500).send(error) // 500 - Internal Server Error,
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, author: req.user._id }) // with auth middleware we have access to the authenticated user id

        if(!task){
            return res.status(404).send() // 404 - Not Found, Send Task not found
        }

        res.render('tasks', { 
            user: req.user,
            title: 'View Tasks',
            task,
            action: 'Deleted',
            display: "display: block;" 
        })

    } catch (error) {
        res.status(500).send(error) // 500 - Internal Server Error, Send Service Down
    }
})

module.exports = router
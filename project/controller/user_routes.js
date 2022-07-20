/////////////////////////////////////////
// First, import dependencies
/////////////////////////////////////////
const express = require('express')
const User = require('../models/user.js')
// bcrypt is used to hash(read: encrypt) passwords
const bcrypt = require('bcryptjs')

/////////////////////////////////////////
// Create a router
/////////////////////////////////////////
const router = express.Router()

/////////////////////////////////////////
// list out our routes
/////////////////////////////////////////
// two sign up routes
// one GET to show the form
router.get('/signup', (req, res) => {
    res.render('users/signup.liquid')
})
// one POST to make the db request
router.post('/signup', async (req, res) => {
    console.log('this is our initial request body:', req.body)
    req.body.password = await bcrypt.hash(
        req.body.password,
        await bcrypt.genSalt(10)
    )

    // now that our password is hashed, we can create a user
    console.log('this is our request body AFTER hashing:', req.body)
    User.create(req.body)
        .then(user => {
            console.log('this is the new user', user)
            res.redirect('/users/login')
        })
        .catch(error => {
            console.log(error)
            res.json(error)
        })
})

// two login routes
// one GET to show the form
router.get('/login', (req, res) => {
    res.render('users/login.liquid')
})
// one POST to login and create the session
router.post('/login', async (req, res) => {
    console.log('this is the request object:', req)
    // destructure dat from request body
    const { username, password } = req.body
    console.log('this is the session', req.session)
    User.findOne({username})
        .then(async (user) => {
            // we check if the user exists
            // if they do, we'll compare passwords and make sure it's correct
            if (user) {
                // compare the password
                // bcrypt.compare evaluates to a truthy or falsy value
                const result = await bcrypt.compare(password, user.password)

                if (result) {
                    req.session.username = username
                    req.session.loggedIn = true
                    req.session.userId = user._id
                    console.log('this is the session after login', req.session)
                    res.redirect('/title/my-stocks')
                } else {
                    // res.json({error: 'username or password is incorrect'})
                    const invalidPassword = true
                    const validUser = username
                    res.render('users/login.liquid', { invalidPassword, validUser })
                }
            } else {
                // res.json({error: 'user does not exist'})
                const invalidUser = true
                res.render('users/login.liquid', { invalidUser })
            }
        }) 
        .catch(error => {
            console.log(error)
            res.json(error)
        })    
})

// logout route
// can be a GET that calls destroy on our session
router.get('/logout', (req, res) => {
    // destroy the session and redirect to the main page
    req.session.destroy(ret => {
        console.log('this is the error in logout', ret)
        console.log('session has been destroyed')
        console.log(req.session)
        res.redirect('/users/login')
    })
})

/////////////////////////////////////////
// export our router
/////////////////////////////////////////
module.exports = router
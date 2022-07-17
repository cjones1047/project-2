const express = require('express')
// making a router
const router = express.Router()
// importing Stock model to access database
const Stock = require('../models/stock.js')
// this allows us to load our env variables
require('dotenv').config()

///////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////

// DELETE
router.delete('/my-stocks/:id', (req, res) => {
    const stockId = req.params.id

    Stock.findByIdAndRemove(stockId)
        .then(stock => {
            res.redirect('/title/my-stocks')
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Home Page
// localhost:3000/title
router.get('/', (req, res) => {
    res.render('pages/home.liquid')
})

// GET - Search Page
// localhost:3000/title/search-stock
router.get('/search-stock', (req, res) => {
    res.render('pages/search.liquid')
})

// GET - Index/My Stocks Page
// localhost:3000/title/my-stocks
router.get('/my-stocks', (req, res) => {
    // mongoose to find all stocks
    Stock.find({})
        .then(stocks => {
            // res.json(stocks) - return stocks as json
            res.render('pages/index-stocks.liquid', { stocks })
        })
        .catch(err => {
            res.json(err)
        })
})

// POST - create a Stock recently added
router.post('/my-stocks', (req, res) => {
    
    // when we have user-specific stocks, we'll add a username upon creation
    // remember, when we logged in, we saved the username to the session object
    // TODO: need to get a users ._id somehow and change this line
    // req.body.owner = req.session.userId

    Stock.create(req.body)
        .then(stock => {
            console.log(stock)
            res.redirect('/title/my-stocks')
            // res.json(stock)
        })
        .catch(err => {
            res.json(err)
        })
})

// POST - create a Stock recently added
router.delete('/my-stocks', (req, res) => {
    
    // when we have user-specific stocks, we'll add a username upon creation
    // remember, when we logged in, we saved the username to the session object
    // TODO: need to get a users ._id somehow and change this line
    // req.body.owner = req.session.userId

    Stock.create(req.body)
        .then(stock => {
            console.log(stock)
            res.redirect('/title/my-stocks')
            // res.json(stock)
        })
        .catch(err => {
            res.json(err)
        })
})

///////////////////////////////////////////////////

module.exports = router
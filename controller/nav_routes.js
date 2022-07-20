const express = require('express')
// making a router
const router = express.Router()
// importing Stock model to access database
const Stock = require('../models/stock.js')
// importing Portfolio model to access database
const Portfolio = require('../models/portfolio.js')
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

// DELETE
router.delete('/my-portfolios/:id', (req, res) => {
    const portfolioId = req.params.id

    Portfolio.findByIdAndRemove(portfolioId)
        .then(portfolio => {
            res.redirect('/title/my-portfolios')
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - More About Our Way Page
// localhost:3000/title/our-way
router.get('/our-way', (req, res) => {
    res.render('pages/home.liquid')
})

// GET - Search Page AND Home Page
// localhost:3000/title/search-stock
router.get('/search-stock', (req, res) => {
    res.render('pages/search.liquid')
})

// GET - Index/My Stocks Page
// localhost:3000/title/my-stocks
router.get('/my-stocks', (req, res) => {
    // mongoose to find all stocks
    Stock.find({ owner: req.session.userId })
        .then(stocks => {
            // res.json(stocks) - return stocks as json
            res.render('pages/index-stocks.liquid', { stocks })
        })
        .catch(err => {
            res.json(err)
        })
})

// GET - Index/My Portfolios Page
// localhost:3000/title/my-portfolios
router.get('/my-portfolios', (req, res) => {
    // mongoose to find all portfolios
    Portfolio.find({ owner: req.session.userId })
        .then(portfolios => {
            // res.json(portfolios) - return portfolios as json
            res.render('pages/index-portfolios.liquid', { portfolios })
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
    req.body.owner = req.session.userId

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

// POST - create a Portfolio recently added
router.post('/my-portfolios', (req, res) => {
    
    // when we have user-specific stocks, we'll add a username upon creation
    // remember, when we logged in, we saved the username to the session object
    // TODO: need to get a users ._id somehow and change this line
    req.body.owner = req.session.userId

    Portfolio.create(req.body)
        .then(portfolio => {
            console.log(portfolio)
            res.redirect('/title/my-portfolios')
            // res.json(portfolio)
        })
        .catch(err => {
            res.json(err)
        })
})

///////////////////////////////////////////////////

module.exports = router
const express = require('express')
const puppeteer = require('puppeteer-extra');
// importing Stock model to access database
const Stock = require('../models/stock.js')
// importing Portfolio model to access database
const Portfolio = require('../models/portfolio.js')
// making a router
const router = express.Router()
// this allows us to load our env variables
require('dotenv').config()

///////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////

// GET - New Portfolio Page
// localhost:3000/title/portfolios/new
router.get('/new', (req, res) => {
    // mongoose to find all stocks
    Stock.find({})
        .then(stocks => {
            // res.json(stocks) - return stocks as json
            res.render('pages/new-portfolio.liquid', { stocks })
        })
        .catch(err => {
            res.json(err)
        })
})

// localhost:3000/title/portfolios/:portfolioId <- A single Portfolio can have many allocations
router.post('/:portfolioId', (req, res) => {
    const portfolioId = req.params.portfolioId
    console.log(req.body)

    req.body.owner = req.session.userId

    Portfolio.findById(portfolioId)
        // after we found a portfolio
        // take that portfolio and add the comment
        .then(portfolio => {
            // single portfolio doc there is a field called allocations
            portfolio.allocations.push(req.body)

            // if we change a doc, we have to return and call .save() on the doc
            return portfolio.save()
        })
        .then(portfolio => {
            res.redirect(`/title/portfolios/${portfolio._id}`)
        })
        .catch(err => {
            res.json(err)
        })
})

// localhost:3000/title/portfolios/:id
router.get('/:id', (req, res) => {
    const portfolioId = req.params.id

    Portfolio.findById(portfolioId)
        .then(portfolio => {
            // res.json(stocks) - return stocks as json
            // console.log(portfolioId)
            res.render('pages/edit-portfolio.liquid', { portfolio })
        })
        .catch(err => {
            res.json(err)
        })
})

// localhost:3000/title/portfolios/:portfolioId/:allocationId
// Delete a single allocation to the current portfolio displayed on the edit page
router.delete('/:portfolioId/:allocationId', (req, res) => {
    const portfolioId = req.params.portfolioId
    const allocationId = req.params.allocationId

    Portfolio.findById(portfolioId) // single portfolio doc, and inside a portfolio doc wewill have many allocations
        .then(portfolio => {
            const allocation = portfolio.allocations.id(allocationId)

            // remove allocation
            allocation.remove()

            // since I've changed the 'allocations' field by one, I've got to return that allocation
            return portfolio.save()
        })
        .then(portfolio => {
            res.redirect(`/title/portfolios/${portfolioId}`)
        })
        .catch(err => {
            res.send(err)
        })
})

///////////////////////////////////////////////////

///////////////////////////////////////////////////

module.exports = router
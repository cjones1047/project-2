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
    res.render('pages/new-portfolio.liquid')
})

///////////////////////////////////////////////////

///////////////////////////////////////////////////

module.exports = router
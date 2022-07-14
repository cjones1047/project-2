const express = require('express')
// making a router
const router = express.Router()
// this allows us to load our env variables
require('dotenv').config()

///////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////

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

///////////////////////////////////////////////////

module.exports = router
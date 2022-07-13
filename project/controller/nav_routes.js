const express = require('express')
// making a router
const router = express.Router()

// GET - Home
// localhost:3000/title
router.get('/', (req, res) => {
    res.render('pages/home.liquid')
})

module.exports = router
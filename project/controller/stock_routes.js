const express = require('express')
// making a router
const router = express.Router()
// this allows us to load our env variables
require('dotenv').config()

///////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////

// PUT - Renders pages/show-stock.liquid using user-entered ticker
router.put('/searchedStock', (req, res) => {
    const searchedStock = req.body.stock

    const options = {
        method: 'POST',
        headers: {
            'content-type': 'text/plain',
            'X-RapidAPI-Key': 'f398cfef5fmsh05e39c9649621e0p1dde23jsn0161f333b079',
            'X-RapidAPI-Host': 'hotstoks-sql-finance.p.rapidapi.com'
        },
        body: `"SELECT * FROM stocks WHERE symbol in ('${searchedStock}') ORDER BY price_change_percent_1m DESC"`
    };
    
    fetch('https://hotstoks-sql-finance.p.rapidapi.com/query', options)
        .then(response => response.json())
        .then(response => {
            console.log(response)
            res.render('title/show-stock.liquid', { thisStock : response })
        })
        .catch(err => console.error(err));
})

///////////////////////////////////////////////////

module.exports = router
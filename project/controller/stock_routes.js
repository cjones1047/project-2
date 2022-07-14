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

    const fmpKey = process.env.FMP_API_KEY
    const quickfsKey = process.env.QUICKFS_API_KEY
    
    fetch(`https://public-api.quickfs.net/v1/data/all-data/${searchedStock}:US?api_key=${quickfsKey}`)
        .then(response => response.json())
        .then(response => {
            // console.log(response)
            thisStockData(response.data)
            res.send(response)
            // res.render('title/show-stock.liquid', { thisStock : response })
        })
        .catch(err => console.error(err));
})

///////////////////////////////////////////////////
function thisStockData (thisData) {
    console.log(thisData.exchange)
    console.log(thisData.metadata.name)
    console.log(thisData.exchange)
}
///////////////////////////////////////////////////

module.exports = router
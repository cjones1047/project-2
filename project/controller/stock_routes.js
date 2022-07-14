const express = require('express')
const puppeteer = require('puppeteer')
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

    async function scrapeCurrentPrice(priceUrl) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(priceUrl);

        await page.waitForXPath('/html/body/div[1]/div/div/div[1]/div/div[2]/div/div/div[6]/div/div/div/div[3]/div[1]/div/fin-streamer[1]/span');
        const [element1] = await page.$x('/html/body/div[1]/div/div/div[1]/div/div[2]/div/div/div[6]/div/div/div/div[3]/div[1]/div/fin-streamer[1]/span');
        const text1 = await element1.getProperty('textContent');
        const sharePrice = await text1.jsonValue();

        browser.close()

        fetch(`https://public-api.quickfs.net/v1/data/all-data/${searchedStock}:US?api_key=${quickfsKey}`)
            .then(response => response.json())
            .then(response => {
                // console.log(response)
                const stockExchange = response.data.exchange
                const stockName = response.data.metadata.name
                res.send(`
                    ${stockExchange}
                    ${stockName}
                    ${sharePrice}
                `)
                // res.render('title/show-stock.liquid', { thisStock : response })
            })
            .catch(err => console.error(err));

    }
    scrapeCurrentPrice(`https://finance.yahoo.com/quote/${searchedStock}/history?period1=1137196800&period2=1518566400&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`)
})

///////////////////////////////////////////////////

///////////////////////////////////////////////////

module.exports = router
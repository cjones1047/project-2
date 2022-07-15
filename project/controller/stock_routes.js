const express = require('express')
const puppeteer = require('puppeteer-extra');
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

        //identify element with attribute selector
        const el1 = await page.$("fin-streamer[class='Fw(b) Fz(36px) Mb(-4px) D(ib)']")
        //obtain text
        const el1Text = await (await el1.getProperty('textContent')).jsonValue()
        console.log("Obtained text is: " + el1Text)

        const sharePrice = el1Text

        // //identify element with attribute selector
        // const el2 = await page.$("table[class='W(100%) M(0)']")
        // //obtain text
        // const el2Text = await (await el2.getProperty('textContent')).jsonValue()
        // console.log("Obtained table is: " + el2Text)
        
        // const priceHx = el2Text (USE priceHx AS TEMPLATE LITERAL FARTHER DOWN)

        browser.close()

        fetch(`https://public-api.quickfs.net/v1/data/all-data/${searchedStock}:US?api_key=${quickfsKey}`)
            .then(response => response.json())
            .then(response => {
                // console.log(response)

                const annualData = response.data.financials.annual
                const ttmData = response.data.financials.ttm
                const metaData = response.data.metadata

                // make a 'column headers' array for top row of table
                    // First column: nothing due to being all row titles below it, next 10 column headers: just 10 most recent years, then 1 column for: TTM, and 5 columns for: 10yrCAGR, 7yrCAGR, 5yrCAGR, 3yrCAGR, Growth in TTM
                    // Total: 17 columns
                // make a separate array for every subsequent row of the table with following format:
                    // 1 index for row title, 10 indices for 10 years of annual metrics, 1 indice for TTM metric of each column, and 5 more columns for each CAGR of row with column titles above (have to run math formulas for last 5 columns)
                    // CAGR % formula: (((recent year/oldest year)^1/# of years)*100)-100
                // this way ^^ you can manipulate the data for each row using array methods and math functions as well

                res.send(`
                    ${sharePrice}
                `)

                // res.render('title/show-stock.liquid', { thisStock : response })
            })
            .catch(err => console.error(err));

    }
    scrapeCurrentPrice(`https://finance.yahoo.com/quote/${searchedStock}/history?p=${searchedStock}`)
})

///////////////////////////////////////////////////

///////////////////////////////////////////////////

module.exports = router
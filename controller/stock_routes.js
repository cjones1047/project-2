const express = require('express')
const puppeteer = require('puppeteer-extra');
const chromium = require('chromium');
// importing Stock model to access database
const Stock = require('../models/stock.js')
// making a router
const router = express.Router()
// this allows us to load our env variables
require('dotenv').config()

///////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////

// UPDATE - Renders pages/show-stock.liquid using user-entered ticker
router.put('/searchedStock', (req, res) => {
    const searchedStock = req.body.stock

    const fmpKey = process.env.FMP_API_KEY
    const quickfsKey = process.env.QUICKFS_API_KEY

    async function scrapeCurrentPrice(priceUrl) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox']
          })
        const page = await browser.newPage();

        await page.goto(priceUrl);

        //identify element with attribute selector
        const el1 = await page.$("fin-streamer[class='Fw(b) Fz(36px) Mb(-4px) D(ib)']")
        //obtain text
        const el1Text = await (await el1.getProperty('textContent')).jsonValue()
        console.log("Obtained price is: " + el1Text)

        const lastSharePrice = el1Text

        // // //identify element with attribute selector
        // // const el2 = await page.$("table[class='W(100%) M(0)']")
        // // //obtain text
        // // const el2Text = await (await el2.getProperty('textContent')).jsonValue()
        // // console.log("Obtained table is: " + el2Text)
        
        // // const priceHx = el2Text (USE priceHx AS TEMPLATE LITERAL FARTHER DOWN)

        browser.close()

        fetch(`https://public-api.quickfs.net/v1/data/all-data/${searchedStock}:US?api_key=${quickfsKey}`)
            .then(response => response.json())
            .then(response => {
                // console.log(response)

                const annualData = response.data.financials.annual
                const ttmData = response.data.financials.ttm
                const metaData = response.data.metadata

                // convert any given long numbers to shorter format:
                function shortenBigNum(bigNum) {
                    const sign = Math.sign(Number(bigNum));
                    // Divides numbers >= 1 billion by 1 billion and appends "B"
                    return Math.abs(Number(bigNum)) >= 1.0e9
                        ? sign * (Math.abs(Number(bigNum)) / 1.0e9).toFixed(2) + "B"
                    : // Divides numbers >= 1 million by 1 million and appends "M"
                        Math.abs(Number(bigNum)) >= 1.0e6
                        ? sign * (Math.abs(Number(bigNum)) / 1.0e6).toFixed(2) + "M"
                    : // Appends "K" in place of 3-5 zeroes
                        Math.abs(Number(bigNum)) >= 1.0e3
                        ? sign * (Math.abs(Number(bigNum)) / 1.0e3).toFixed(2) + "K"
                        : Math.abs(Number(bigNum));
                }

                // calculate the compounded growth rate between two pieces of data
                function calcCAGR (firstDatum, lastDatum, years) {
                    const ratio = firstDatum/lastDatum
                    const factor = ratio**(1/years)
                    const percent = (factor*100)-100
                    if(isNaN(percent)) return ('0')
                    else if(percent === Infinity) return ('0')
                    else return (parseFloat(percent.toFixed(1)))
                }

                // make a 'column headers' array for top row of table
                    // First column: nothing due to being all row titles below it, next 10 column headers: just 10 most recent years, then 1 column for: TTM, and 5 columns for: 10yrCAGR, 7yrCAGR, 5yrCAGR, 3yrCAGR, Last Filed Year's Growth
                    // Total: 17 columns
                // make a separate array for every subsequent row of the table with following format:
                    // 1 index for row title, 10 indices for 10 years of annual metrics, 1 indice for TTM metric of each column (if applicable), and 5 more columns for each CAGR of row with column titles above (have to run math formulas for last 5 columns, also only done if applicable)
                    // CAGR % formula: (((recent year/oldest year)^1/# of years)*100)-100
                    // 11 row headers:
                        // Shares, Revenue ($), Earnings ($), Equity ($), Cash Flow from Operations ($), CapEx ($), Free Cash Flow ($), Long-Term Debt ($), Short-Term Debt ($), Return on Equity (%), Return of Invested Capital (%)
                // this way ^^ you can manipulate the data for each row using array methods and math functions as well

                // console.log(metaData.name)

                // set the "annualData.fcf" array to be filled with data from our own custom calculation for free cash flow

                function seedFCF () {
                    const realFCF = []
                    let size = 10
                    for(let i=0;realFCF.length < size;i++) {
                        const fcf = annualData.cf_cfo[annualData.cf_cfo.length-(size-i)] + annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-(size-i)]
                        if(isNaN(fcf)) {
                            size--
                            continue
                        }
                        else realFCF.push(fcf)
                        if(realFCF.length === size) {
                            annualData.fcf = realFCF
                        }
                    }
                }
                seedFCF();

                const makeTableData = () => {

                    for (const datum in annualData) {
                        
                        if(datum == "fcf") {
                            const row = ['FCF ($)']
                            annualData.fcf = row.concat(
                                annualData.fcf.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.cf_cfo + ttmData.cfi_ppe_purchases),
                                calcCAGR(
                                        annualData.fcf[annualData.fcf.length-1], 
                                        annualData.fcf[annualData.fcf.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.fcf[annualData.fcf.length-1], 
                                    annualData.fcf[annualData.fcf.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.fcf[annualData.fcf.length-1], 
                                    annualData.fcf[annualData.fcf.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.fcf[annualData.fcf.length-1], 
                                    annualData.fcf[annualData.fcf.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.fcf[annualData.fcf.length-1], 
                                    annualData.fcf[annualData.fcf.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.fcf)
                            // res.send(`${annualData.fcf}`)
                        }

                        if(datum == "shares_basic") {
                            const row = ['Shares']
                            annualData.shares_basic = row.concat(
                                annualData.shares_basic.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.shares_basic),
                                calcCAGR(
                                        annualData.shares_basic[annualData.shares_basic.length-1], 
                                        annualData.shares_basic[annualData.shares_basic.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.shares_basic[annualData.shares_basic.length-1], 
                                    annualData.shares_basic[annualData.shares_basic.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.shares_basic[annualData.shares_basic.length-1], 
                                    annualData.shares_basic[annualData.shares_basic.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.shares_basic[annualData.shares_basic.length-1], 
                                    annualData.shares_basic[annualData.shares_basic.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.shares_basic[annualData.shares_basic.length-1], 
                                    annualData.shares_basic[annualData.shares_basic.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.shares_basic)
                            // res.send(`${annualData.shares_basic}`)
                        }

                        if(datum == "revenue") {
                            const row = ['Revenue ($)']
                            annualData.revenue = row.concat(
                                annualData.revenue.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.revenue),
                                calcCAGR(
                                        annualData.revenue[annualData.revenue.length-1], 
                                        annualData.revenue[annualData.revenue.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.revenue[annualData.revenue.length-1], 
                                    annualData.revenue[annualData.revenue.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.revenue[annualData.revenue.length-1], 
                                    annualData.revenue[annualData.revenue.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.revenue[annualData.revenue.length-1], 
                                    annualData.revenue[annualData.revenue.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.revenue[annualData.revenue.length-1], 
                                    annualData.revenue[annualData.revenue.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.revenue)
                            // res.send(`${annualData.revenue}`)
                        }

                        if(datum === "net_income") {
                            const row = ['Earnings ($)']
                            annualData.net_income = row.concat(
                                annualData.net_income.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.net_income),
                                calcCAGR(
                                        annualData.net_income[annualData.net_income.length-1], 
                                        annualData.net_income[annualData.net_income.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.net_income[annualData.net_income.length-1], 
                                    annualData.net_income[annualData.net_income.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.net_income[annualData.net_income.length-1], 
                                    annualData.net_income[annualData.net_income.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.net_income[annualData.net_income.length-1], 
                                    annualData.net_income[annualData.net_income.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.net_income[annualData.net_income.length-1], 
                                    annualData.net_income[annualData.net_income.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.net_income)
                            // res.send(`${annualData.net_income}`)
                        }

                        if(datum === "total_equity") {
                            const row = ['Equity ($)']
                            annualData.total_equity = row.concat(
                                annualData.total_equity.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.total_equity),
                                calcCAGR(
                                        annualData.total_equity[annualData.total_equity.length-1], 
                                        annualData.total_equity[annualData.total_equity.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.total_equity[annualData.total_equity.length-1], 
                                    annualData.total_equity[annualData.total_equity.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.total_equity[annualData.total_equity.length-1], 
                                    annualData.total_equity[annualData.total_equity.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.total_equity[annualData.total_equity.length-1], 
                                    annualData.total_equity[annualData.total_equity.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.total_equity[annualData.total_equity.length-1], 
                                    annualData.total_equity[annualData.total_equity.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.total_equity)
                            // res.send(`${annualData.total_equity}`)
                        }

                        if(datum === "cf_cfo") {
                            const row = ['CFO ($)']
                            annualData.cf_cfo = row.concat(
                                annualData.cf_cfo.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.cf_cfo),
                                calcCAGR(
                                        annualData.cf_cfo[annualData.cf_cfo.length-1], 
                                        annualData.cf_cfo[annualData.cf_cfo.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.cf_cfo[annualData.cf_cfo.length-1], 
                                    annualData.cf_cfo[annualData.cf_cfo.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.cf_cfo[annualData.cf_cfo.length-1], 
                                    annualData.cf_cfo[annualData.cf_cfo.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.cf_cfo[annualData.cf_cfo.length-1], 
                                    annualData.cf_cfo[annualData.cf_cfo.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.cf_cfo[annualData.cf_cfo.length-1], 
                                    annualData.cf_cfo[annualData.cf_cfo.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.cf_cfo)
                            // res.send(`${annualData.cf_cfo}`)
                        }

                        if(datum === "cfi_ppe_purchases") {
                            const row = ['CapEx ($)']
                            annualData.cfi_ppe_purchases = row.concat(
                                annualData.cfi_ppe_purchases.slice(-10).flatMap(x => shortenBigNum(Math.abs(x))),
                                shortenBigNum(Math.abs(ttmData.cfi_ppe_purchases)),
                                calcCAGR(
                                        annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-1], 
                                        annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-1], 
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-1], 
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-1], 
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-1], 
                                    annualData.cfi_ppe_purchases[annualData.cfi_ppe_purchases.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.cfi_ppe_purchases)
                            // res.send(`${annualData.cfi_ppe_purchases}`)
                        }

                        if(datum === "lt_debt") {
                            const row = ['LT Debt ($)']
                            annualData.lt_debt = row.concat(
                                annualData.lt_debt.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.lt_debt),
                                calcCAGR(
                                        annualData.lt_debt[annualData.lt_debt.length-1], 
                                        annualData.lt_debt[annualData.lt_debt.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.lt_debt[annualData.lt_debt.length-1], 
                                    annualData.lt_debt[annualData.lt_debt.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.lt_debt[annualData.lt_debt.length-1], 
                                    annualData.lt_debt[annualData.lt_debt.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.lt_debt[annualData.lt_debt.length-1], 
                                    annualData.lt_debt[annualData.lt_debt.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.lt_debt[annualData.lt_debt.length-1], 
                                    annualData.lt_debt[annualData.lt_debt.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.lt_debt)
                            // res.send(`${annualData.lt_debt}`)
                        }

                        if(datum === "st_debt") {
                            const row = ['ST Debt ($)']
                            annualData.st_debt = row.concat(
                                annualData.st_debt.slice(-10).flatMap(x => shortenBigNum(x)),
                                shortenBigNum(ttmData.st_debt),
                                calcCAGR(
                                        annualData.st_debt[annualData.st_debt.length-1], 
                                        annualData.st_debt[annualData.st_debt.length-10],
                                        10
                                    ),
                                calcCAGR(
                                    annualData.st_debt[annualData.st_debt.length-1], 
                                    annualData.st_debt[annualData.st_debt.length-7],
                                    7
                                ),
                                calcCAGR(
                                    annualData.st_debt[annualData.st_debt.length-1], 
                                    annualData.st_debt[annualData.st_debt.length-5],
                                    5
                                ),
                                calcCAGR(
                                    annualData.st_debt[annualData.st_debt.length-1], 
                                    annualData.st_debt[annualData.st_debt.length-3],
                                    3
                                ),
                                calcCAGR(
                                    annualData.st_debt[annualData.st_debt.length-1], 
                                    annualData.st_debt[annualData.st_debt.length-2],
                                    2
                                ),
                            )
                            // console.log(annualData.st_debt)
                            // res.send(`${annualData.st_debt}`)
                        }

                        if(datum === "roe") {
                            const row = ['ROE (%)']
                            annualData.roe = row.concat(
                                annualData.roe.slice(-10).flatMap(x => {
                                    x = x*100
                                    return x.toFixed(1)
                                })
                            )
                            // console.log(annualData.roe)
                            // res.send(`${annualData.roe}`)
                        }

                        if(datum === "roic") {
                            const row = ['ROIC (%)']
                            annualData.roic = row.concat(
                                annualData.roic.slice(-10).flatMap(x => {
                                    x = x*100
                                    return x.toFixed(1)
                                })
                            )
                            // console.log(annualData.roic)
                            // res.send(`${annualData.roic}`)
                        }

                    }
                }
                makeTableData();

                const tableData = {
                    header: [
                        '',
                        annualData.fiscal_year_number.slice(-10).map(x => x.toString()),
                        'TTM',
                        '10yrCAGR',
                        '7yrCAGR',
                        '5yrCAGR',
                        '3yrCAGR',
                        "1yrGR"
                    ].flatMap(x => x),
                    row1: annualData.shares_basic,
                    row2: annualData.revenue,
                    row3: annualData.net_income,
                    row4: annualData.total_equity,
                    row5: annualData.cf_cfo,
                    row6: annualData.cfi_ppe_purchases,
                    row7: annualData.fcf,
                    row8: annualData.lt_debt,
                    row9: annualData.st_debt,
                    row10: annualData.roe,
                    row11: annualData.roic
                }

                // console.log(tableData)

                // ourPrice is the lower of two values: one being the value of a company based on its Free Cash Flow and the other being the value of the same company based on how the market has typically valued its Earnings Per Share

                const findOurPrice = () => {
                    const allGrowthRates = 
                        [
                            tableData.row2.slice(-5).map(x => parseFloat(x)),
                            tableData.row3.slice(-5).map(x => parseFloat(x)),
                            tableData.row4.slice(-5).map(x => parseFloat(x)),
                            tableData.row7.slice(-5).map(x => parseFloat(x))
                        ].flatMap(x=>x)

                    const trueGrowthRate = Math.floor(allGrowthRates.reduce((a, b) => a + b, 0)/allGrowthRates.length)
                    
                    const multiple = trueGrowthRate*2

                    let ourGrowthRate = trueGrowthRate

                    if(trueGrowthRate > 10) ourGrowthRate = 10
                    // console.log(allGrowthRates)

                    const recentFCFPS = (
                        (
                        (
                            tableData.row7.slice(-9,-6)
                            .map(x => {
                                const characters = x.split('')
                                if(characters[characters.length-1] === "B") return parseFloat(x)*1000000000
                                else if(characters[characters.length-1] === "M") return parseFloat(x)*1000000
                                else if(characters[characters.length-1] === "K") return parseFloat(x)*1000
                                else return parseFloat(x)
                            })
                            .reduce((a,b) => a+b, 0)/3
                        )/ttmData.shares_basic
                        )*((trueGrowthRate/100)+1)
                        ).toFixed(2)

                    const recentEPS = (
                        (
                        (
                            tableData.row3.slice(-9,-6)
                            .map(x => {
                                const characters = x.split('')
                                if(characters[characters.length-1] === "B") return parseFloat(x)*1000000000
                                else if(characters[characters.length-1] === "M") return parseFloat(x)*1000000
                                else if(characters[characters.length-1] === "K") return parseFloat(x)*1000
                                else return parseFloat(x)
                            })
                            .reduce((a,b) => a+b, 0)/3
                        )/ttmData.shares_basic
                        )*((trueGrowthRate/100)+1)
                        ).toFixed(2)
                    
                    const fcfPrice = () => {
                        let futureFCF = parseFloat(recentFCFPS)
                        for(let i=1;i<9;i++) {
                            futureFCF = futureFCF+
                                (recentFCFPS*(((ourGrowthRate/100)+1)**i))
                        }
                        return parseFloat(futureFCF.toFixed(2))
                    }

                    const epsPrice = () => {
                        const currentE = parseFloat(recentEPS)
                        const fairPrice = (
                            (
                            currentE*
                            (((ourGrowthRate/100)+1)**10)
                            )*multiple
                            )/(1.15**10)
                        const discountedPrice = fairPrice*0.5
                        return parseFloat(discountedPrice.toFixed(2))
                    }
                    
                    // console.log(trueGrowthRate)
                    // console.log(ourGrowthRate)
                    // console.log(recentFCFPS)
                    // console.log(recentEPS)
                    console.log(`Priced on Cash Flow: ${fcfPrice()}`)
                    console.log(`Priced on Earnings: ${epsPrice()}`)

                    if(fcfPrice() < epsPrice()) return fcfPrice()
                    else return epsPrice()
                }
                console.log(findOurPrice())

                // User.findById({userId: `${req.session.userId}`}) 
                //     .populate()

                if(req.session.username === undefined) {
                    console.log('no user logged in')
                    Stock.exists({symbol:`${metaData.symbol}`, owner: undefined}, function (err, doc) {
                        if (err){
                            console.error(err)
                        } else if (doc) {
                            console.log("Found it")
                            console.log(doc)
                            console.log("Original Doc : ",doc)
                            const showAdd = false
                            res.render('pages/show-stock.liquid', { lastSharePrice, tableData, metaData, ttmData, showAdd, ourPrice: findOurPrice()
                            })
    
                            // so that the lastPriceViewed in the already added stock has an updated price
                            
                        } else {
                            console.log("No schema exists")
                            const showAdd = true
                            res.render('pages/show-stock.liquid', { lastSharePrice, tableData, metaData, ttmData, showAdd, ourPrice: findOurPrice() })
                        }
                    });
                }

                Stock.exists({symbol:`${metaData.symbol}`, owner: `${req.session.userId}`}, function (err, doc) {
                    if (err){
                        console.error(err)
                    } else if (doc) {
                        console.log("Found it")
                        console.log(doc)
                        console.log("Original Doc : ",doc)
                        const showAdd = false
                        res.render('pages/show-stock.liquid', { lastSharePrice, tableData, metaData, ttmData, showAdd, ourPrice: findOurPrice() 
                        })

                        // so that the lastPriceViewed in the already added stock has an updated price
                        
                    } else {
                        console.log("No schema exists")
                        const showAdd = true
                        res.render('pages/show-stock.liquid', { lastSharePrice, tableData, metaData, ttmData, showAdd, ourPrice: findOurPrice() })
                    }
                });

            })
            .catch(err => console.error(err));

    }
    scrapeCurrentPrice(`https://finance.yahoo.com/quote/${searchedStock}/history?p=${searchedStock}`)
})

///////////////////////////////////////////////////

///////////////////////////////////////////////////

module.exports = router
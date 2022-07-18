// using an already connected mongoose NOT a fresh one from node_modules
const mongoose = require('./connection.js')

// inside of mongoose, I want the keys named 'Schema' and 'model' to be used without specifying 'mongoose', so I'm using this destructuring syntax
const { Schema, model } = mongoose

const portfolioSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    allocations: []
}, {
    timestamp: true
})

// need to make a model
// this COLLECTION will be called 'portfolios' (lowercase, plural of 'Portfolio')
const Portfolio = model('Portfolio', portfolioSchema)

module.exports = Portfolio
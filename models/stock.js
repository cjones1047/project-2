// using an already connected mongoose NOT a fresh one from node_modules
const mongoose = require('./connection.js')

// inside of mongoose, I want the keys named 'Schema' and 'model' to be used without specifying 'mongoose', so I'm using this destructuring syntax
const { Schema, model } = mongoose

const stockSchema = new Schema({
    name: String,
    symbol: String,
    lastPriceViewed: Number,
    ourPrice: Number,
    subindustry: String,
    owner: {
        type: Schema.Types.ObjectId, // a single User ._id
        ref: 'User' // const User = model('User', userSchema)
        // the string of 'User' is how we reference a model
    }
}, {
    timestamp: true
})

// need to make a model
// this COLLECTION will be called 'stocks' (lowercase, plural of 'Stock')
const Stock = model('Stock', stockSchema)

module.exports = Stock
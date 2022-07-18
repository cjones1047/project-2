const mongoose = require('./connection')

const allocationSchema = new mongoose.Schema({
    stockSymbol: {
        type: String,
        required: true
    },
    numberOfShares: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = allocationSchema
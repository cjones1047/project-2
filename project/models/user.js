/////////////////////////////////////////
// First, import dependencies
/////////////////////////////////////////
const mongoose = require('./connection')

/////////////////////////////////////////
// define user model
/////////////////////////////////////////
// pull the schema and model constructors from mongoose
const { Schema, model } = mongoose

//make a user schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true // so no two users can have the same username
    },
    password: {
        type: String,
        required: true
    }

})

// make a user model with the user schema
const User = model('User', userSchema)

/////////////////////////////////////////
// export user model
/////////////////////////////////////////
module.exports = User
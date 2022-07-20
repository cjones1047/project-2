// requiring dotenv package so we can get things out of our .env file
require('dotenv').config()

// getting mongoose to use
const mongoose = require('mongoose')

///////////////////// FOR LOCAL CONNECTION //////////////////////////
// const DATABASE_URI = process.env.DATABASE_URI
// const config = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }

// // connect our mongoDB to mongoose
// mongoose.connect(DATABASE_URI, config)

// mongoose.connection
// // handle the opening of the connections
// // running code block on open
// // console logging a string
//     .on('open', () => console.log('Connected to Mongoose'))
//     // since we have opened a connection, we've gotta close it
//     // running a code block on close
//     .on('close', () => console.log('Disconnected from Mongoose'))
//     // handle any errors that might happen
//     // running a code block on an error
//     // using console.err to see that error
//     .on('error', err => console.err(err))
///////////////////////////////////////////////////////////////////////

// Fire off the connection to Mongo DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  
  mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${mongoose.connection.host}:${mongoose.connection.port}`);
  });
  
  mongoose.connection.on("error", (err) => {
    console.log("Could not connect to MongoDB!", err);
  });

module.exports = mongoose
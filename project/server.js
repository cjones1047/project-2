//==============================
// import dependencies
//==============================

// this allows us to load our env variables
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const methodOverride = require('method-override')

// bring in our session middleware
const session = require('express-session')
const MongoStore = require('connect-mongo')

const navRoutes = require('./controller/nav_routes.js')
const stockRoutes = require('./controller/stock_routes.js')
const portfolioRoutes = require('./controller/portfolio_routes.js')
const userRoutes = require('./controller/user_routes.js')

//==============================
// Create our express application object
//==============================
const app = require('liquid-express-views')(express())

//==============================
// General Middleware
//==============================
// this is for request logging
app.use(morgan('tiny'))
app.use(methodOverride('_method'))
// parses urlencoded request bodies
app.use(express.urlencoded({ extended: false }))
// to serve files from public statically
app.use(express.static('public'))

// here's the middleware that sets up our sessions
app.use(
	session({
		secret: process.env.SECRET,
		store: MongoStore.create({
			mongoUrl: process.env.DATABASE_URI
		}),
		saveUninitialized: true,
		resave: false
	})
)

//==============================
// Routes Middleware
//==============================
// middleware so all of navRoutes will have '/title' prepended
app.use('/title', navRoutes)

// middleware so all of stockRoutes will have '/title/stocks' prepended
app.use('/title/stocks', stockRoutes)

// // middleware so all of portfolioRoutes will have '/title/portfolios' prepended
// app.use('/title/portfolios', portfolioRoutes)

// middleware so all of userRoutes will have '/users' prepended
app.use('/users', userRoutes)

app.get('/', (req, res) => {
	res.redirect('/title')
})

//==============================
// Server Listener
//==============================
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`app is listening on port: ${PORT}`)
})

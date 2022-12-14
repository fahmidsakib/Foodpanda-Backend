require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth.route')
const restaurantRouter = require('./routes/restaurant.route')
const orderRouter = require('./routes/order.route')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')


app.use(cors())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("Error", err))


app.use(express.static('public'))
app.use(express.json())
app.use(morgan('dev'))


app.use('/auth', authRouter)
app.use(authenticateRequest)
app.use('/restaurants', restaurantRouter)
app.use('/orders', orderRouter)

app.listen(process.env.PORT || 8000)


function authenticateRequest(req, res, next) {
    const authHeaderInfo = req.headers['authorization']

    if (authHeaderInfo === undefined) {
        res.status(401).send("No Token was Provided")
    }

    const token = authHeaderInfo.split(" ")[1]
    if (token === undefined) {
        res.status(401).json({ error: "Proper token was not Provided" })
    }
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.payload = payload
        next()
    } catch (error) {
        res.status(401).json({ error: "Invalid access token Provided " + error.message })
    }
}
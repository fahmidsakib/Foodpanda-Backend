const express = require('express')
const RestaurentModel = require('../models/restaurant.model')
const router = express.Router()

router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name ) return res.status(400).json({ error: 'Name is required' })
    const newRestaurant = new RestaurentModel({ name, addedBy: req.payload._id })
    try {
        const savedRestaurant = await newRestaurant.save()
        res.status(201).json({ alert: "Restaurant added successfully" })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})

router.post('/signin', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Please provide email and password' })
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser === null) return res.status(400).json({ error: 'User not found' })
    const result = bcrypt.compareSync(password, existingUser.password)
    if (result) {
        const payload = { _id: existingUser._id, name: existingUser.name, email: email.toLowerCase() }
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME })
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME })
        return res.status(200).json({ data: { refreshToken, accessToken, payload } })
    }
    else return res.status(400).json({ error: 'Wrong Password' })
})



module.exports = router
const express = require('express')
const RestaurantModel = require('../models/restaurant.model')
const DishModel = require('../models/dish.model')
// const { route } = require('./auth.route')
const router = express.Router()


router.get('/', async (req, res) => {
    const restaurants = await RestaurantModel.find({})
        .populate('addedBy')
        .populate('dishes')
    // .populate('orders', 'customerId, restaurantId, totalCost')
    res.status(200).json({ data: restaurants })
})

router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })
    const newRestaurant = new RestaurantModel({ name, addedBy: req.payload._id })
    try {
        const savedRestaurant = await newRestaurant.save()
        res.status(201).json({ alert: "Restaurant added successfully" })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


router.post('/:id/add-dish', async (req, res) => {
    const { name, price } = req.body
    if (!name || !price) return res.status(400).json({ error: 'Both name and price is required' })
    const newDish = new DishModel({ name, price, restaurantId: req.params.id })
    const savedDish = await newDish.save()
    try {
        const restaurant = await RestaurantModel.updateOne({ _id: req.params.id }, { $push: { dishes: savedDish._id } })
        res.status(200).send({ alert: "A new dish added to the restaurant" })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


router.get('/:id', async (req, res) => {
    try {
        const restaurant = await RestaurantModel.find({ _id: req.params.id })
            .populate('dishes')
        res.status(200).send({ data: restaurant })
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
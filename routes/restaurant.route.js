const express = require('express')
const RestaurantModel = require('../models/restaurant.model')
const DishModel = require('../models/dish.model')
const OrderModel = require('../models/order.model')
const router = express.Router()


router.get('/', async (req, res) => {
    const restaurants = await RestaurantModel.find({})
        .populate('addedBy')
        .populate('dishes')
        .populate('orders', 'customerId, restaurantId, totalCost')
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


router.get('/:id/orders', async (req, res) => {
    let orders
    try {
        if (req.query.status !== undefined) {
            orders = await OrderModel.find({ restaurantId: req.params.id, status: req.query.status })
                .populate('customerId', 'name')
                .populate('restaurantId', 'name')
        }
        else {
            orders = await OrderModel.find({ restaurantId: req.params.id })
                .populate('customerId', 'name')
                .populate('restaurantId', 'name')
        }
        res.status(200).send({ data: orders })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


router.get('/:id/revenue', async (req, res) => {
    const orders = await OrderModel.find({ restaurantId: req.params.id, status: "completed" })
    console.log(orders)
    let start = orders[0].createdAt.getTime(), end = Date.now(), revenue = 0
    for (let i = 0; i < orders.length; i++){
        console.log(start <= orders[i].updatedAt.getTime() && end >= orders[i].updatedAt.getTime())
        if (start <= orders[i].updatedAt.getTime() && end >= orders[i].updatedAt.getTime()) revenue += orders[i].totalCost
    }
    res.status(200).send({ data: revenue })
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


module.exports = router
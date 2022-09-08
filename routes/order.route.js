const express = require('express')
const RestaurantModel = require('../models/restaurant.model')
const DishModel = require('../models/dish.model')
const OrderModel = require('../models/order.model')
const UserModel = require('../models/user.model')
const router = express.Router()


router.post('/add', async (req, res) => {
    const { restaurantId, dishes } = req.body
    if (!restaurantId || !dishes) return res.status(400).json({ error: 'All field is required' })
    let totalCost = 0
    for (let i = 0; i < dishes.length; i++) {
        const dish = await DishModel.findOne({ _id: dishes[i].dishId })
        totalCost += dish.price * dishes[i].quantity
    }
    const newOrder = new OrderModel({ customerId: req.payload._id, restaurantId, dishes, totalCost, status: 'pending' })
    try {
        const savedOrder = await newOrder.save()
        const getUser = await UserModel.updateOne({ _id: req.payload._id },
            { $push: { orders: savedOrder._id } })
        const getRetaurant = await RestaurantModel.updateOne({ _id: restaurantId },
            { $push: { orders: savedOrder._id } })
        res.status(200).send({ alert: "Your order is Placed" })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


router.post('/:id/update', async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'Status is required' })
    try {
        const getOrder = await OrderModel.updateOne({ _id: req.params.id }, { status: status })
        res.status(200).send({ alert: 'Order status updated' })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


router.get('/:id', async (req, res) => {
    try {
        const getOrder = await OrderModel.find({ _id: req.params.id })
            .populate('customerId', 'name email')
            .populate('restaurantId', 'name')
            .populate('dishes')
        res.status(200).send({ data: getOrder })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


module.exports = router
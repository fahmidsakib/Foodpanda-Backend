const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        restaurentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'restaurent'
        },
        dishes: [
            {
                dishId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'dish',
                },
                quantity: {
                    type: Number,
                    default: 0,
                    required: true,
                }
            }
        ],
        totalCost: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const orderModel = mongoose.model("order", orderSchema)
module.exports = orderModel
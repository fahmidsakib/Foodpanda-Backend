const mongoose = require('mongoose')

const dishSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'restaurant'
        }
    },
    { timestamps: true }
)

const dishModel = mongoose.model("dish", dishSchema)
module.exports = dishModel
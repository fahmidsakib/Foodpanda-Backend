const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,

        },
        dishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dish'
        }],
        orders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'order'
        }],
    },
    { timestamps: true }
)

const restaurantModel = mongoose.model("restaurant", restaurantSchema)
module.exports = restaurantModel
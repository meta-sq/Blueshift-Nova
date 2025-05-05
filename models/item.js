const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: [4, 'Minimum four characters for title']
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    condition: { type: String, required: true },

    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },

    description: { type: String },

    image: { type: String, required: true },

    active: { type: Boolean, default: true },

    totalOffers: {
        type: Number,
        default: 0
    },
    highestOffer: {
        type: Number,
        default: 0
    }

}, { timestamps: true });


const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['textbooks', 'electronics', 'furniture', 'other']
    },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'like new', 'good', 'fair', 'poor']
    },
    images: [{
        type: String
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Available', 'Pending', 'Sold'],
        default: 'Available'
    },
    location: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: [String],
        default: []
    },
    ratings: [{
        rater: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Item', itemSchema); 
// Import necessary modules
const mongoose = require('mongoose');

// Define the FavoriteSong schema
const favoriteSongSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the FavoriteSong model
const FavoriteSong = mongoose.model('FavoriteSong', favoriteSongSchema);

module.exports = FavoriteSong;

const mongoose = require('mongoose');


// Define the schema
const artistSchema = new mongoose.Schema({
    ArtistName: {
        type: String,
    },
    image: {
        fileName: String,
        fileAddress: String
    },
    imageUrl: { type: String },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assuming you have a User model for the followers
    }],
    status: {
        type: String,
        enum: ['activate', 'deactivate'],
        default: 'activate'
    }
}, { timestamps: true }); // This will add createdAt and updatedAt fields

// Create the model
const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;

const mongoose = require('mongoose');

const karaokeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    },
    karaokeFile: {
        fileName: String,
        fileAddress: String,
        karaokeUrl:String,
        },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Karaoke = mongoose.model('Karaoke', karaokeSchema);

module.exports = Karaoke;

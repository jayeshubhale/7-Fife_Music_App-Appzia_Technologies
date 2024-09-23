const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new mongoose.Schema({
    name : {
        type : String,
        // required : true
    },
    songs : [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],
    userId : {
        type: Schema.Types.ObjectId, ref: 'User'
    }
})


module.exports = mongoose.model('PlayList',playlistSchema);
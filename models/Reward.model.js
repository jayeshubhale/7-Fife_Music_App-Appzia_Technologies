const mongoose = require('mongoose');


const rewardSchema = new mongoose.Schema({
    score : {
        type : String,
        required : true
    },
    reward : {
        type : Number,
        required : true
    }
})

module.exports = mongoose.model('Reward',rewardSchema);

const mongoose = require('mongoose');
const constant = require('../util/review.constant');


const reviewSchema = new mongoose.Schema({
    userName : {
        type : String
    },
    review : {
        type : String,
        require : true
    },
    reply : {
        type : String,
        require : true
    },
    status : {
        type : String,
        enum : [constant.status.publish,constant.status.unpublish],
        default : constant.status.publish
    }

},{timestamps:true});

module.exports = mongoose.model('Review',reviewSchema);
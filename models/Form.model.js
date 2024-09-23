const mongoose = require('mongoose');



const formSchema = new mongoose.Schema(
 {
    userName : {
        type : String
    },
    message : {
        type : String,
        require : true
    },
    reply : {
        type : String,
    },
    subject : {
        type : String,
    },
    email : {
        type : String,
        required : true
    }

},{timestamps:true});

module.exports = mongoose.model('Form',formSchema);
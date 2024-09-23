
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
     userName : {
          type : String,
          required : true
     },
     planName : {
        type : String,
        required : true
     },
     mainAmount : {
        type : Number,
        required : true
     },
     offer : {
        type : String
     },
     finalAmount : {
        type : Number
     },
     paymentId :{
        type :String,
        required : true
     },
     paymentMethod : {
        type : String,
        required : true,
     },

},{timestamps:true});

module.exports = mongoose.model('Payment',paymentSchema);
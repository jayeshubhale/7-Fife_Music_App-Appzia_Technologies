const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subconstant = require('../util/subscriptionConstant');

const subcriptionSchema = new mongoose.Schema({
  subscriptionTitle : {
    type : String,
    required :true
  },
  validity :{
    duration : {
        type : String,
        enum : [subconstant.duration.day,subconstant.duration.month,subconstant.duration.year],
        required : true
    },
    count : {
        type : Number,
        default:0
    }
  },

  price : {
    type : Number,
    required : true
  },

  description : {
    type : String,
  },

  offer : {
    type : Number,
    required : true,
    default : 0
  },

 adfree : {
    type : Boolean,
    required : true,
    
 },
 
 download :{
    type : Boolean,
    required : true,
 },
status : {
    type : String,
    enum : [subconstant.status.activate,subconstant.status.deactivate],
    default : subconstant.status.activate
}
},{timestamps : true})

module.exports = mongoose.model('Subscription',subcriptionSchema);
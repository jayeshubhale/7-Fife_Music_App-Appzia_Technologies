const mongoose = require('mongoose');

const adsSettingSchema = new mongoose.Schema({
    adsTiming : {
        minutes :{
            type : Number,
            default : 0
        },
        seconds : {
            type : Number,
            default : 0
        }
        
    },
    adsStatus : {
        type : Boolean,
        default : true
    }
})


module.exports  = mongoose.model('AdsSetting',adsSettingSchema)

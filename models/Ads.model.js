const mongoose = require('mongoose');
const constant = require('../util/ads.constant');

const adsSchema = new mongoose.Schema({
    adsTitle: {
        type: String,
        required: true
    },
    redirectLink: {
        type: String,
        required: true
    },
    advertiseAs: {
        type: String,
        enum: [constant.adsType.image, constant.adsType.video],
        required: true
    },
    advertiseImage: {
        type: String
    },
    advertiseVideo: {
        type: String
    },
    adsTime: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['activate', 'deactivate'],
        default: 'activate'
      },
    adsTiming: {
        minutes: {
            type: Number,
            default: 0
        },
        seconds: {
            type: Number,
            default: 0
        }
    },
    adsStatus: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Ads', adsSchema);

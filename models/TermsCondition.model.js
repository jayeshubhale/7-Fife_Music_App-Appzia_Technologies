const mongoose = require('mongoose');

const termsAndConditionSchema = new mongoose.Schema({
    termsCondition: {
        type: String,
        required: true
    }
}, { timestamps: true });

const TermsAndCondition = mongoose.model('TermsAndCondition', termsAndConditionSchema);

module.exports = TermsAndCondition;

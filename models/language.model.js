const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const languageSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true 
  },
  status: {
    type: String,
    enum: ['activate', 'deactivate'],
    default: 'activate'
  }
}, { timestamps: true });

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;

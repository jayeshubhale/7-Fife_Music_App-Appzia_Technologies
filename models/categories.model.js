const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    fileName: {
      type: String,

    },
    fileAddress: {
      type: String,    }
  },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: ['activate', 'deactivate'],
    default: 'activate'
  }
}, { timestamps: true }); // Add timestamps option here

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

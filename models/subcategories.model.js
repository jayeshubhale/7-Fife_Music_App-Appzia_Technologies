const mongoose = require('mongoose');

// Define the schema for the 'subcategories' collection
const subCategoriesSchema = new mongoose.Schema({
    CategoriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categoryName:{
        type: String,
    },
    SubCategoriesName: {
        type: String,
        required: true
    },
    image: {
        fileName: String,
        fileAddress: String,
        imageUrl: String
      },


    status: {
        type: String,
        enum: ['activate', 'deactivate'],
        default: 'activate'
      }
}, {
    timestamps: true
});

// Create a model based on the schema
const SubCategories = mongoose.model('SubCategories', subCategoriesSchema);

module.exports = SubCategories;
// categorySchema.pre('remove', async function(next) {
//     const category = this;
//     await SubCategory.deleteMany({ CategoriesId: category._id });
//     next();
//   });

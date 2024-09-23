const SubCategories = require('../models/subcategories.model'); // Import SubCategories model
const Categories = require('../models/categories.model');
const Artist = require('../models/artist.model');
const Songs =require("../models/song.model")
const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);
// const fullImageUrl = `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`;


const createsubCategories = async (req, res) => {
  try {
    const category = await Categories.findOne({ _id: req.body.CategoriesId });

    if (!category) {
      return res.status(404).send({
        error_code: 404,
        message: "Category not found"
      });
    }

    // Construct the image URL
    const imagePath = `uploads/${req.file.filename}`;
    const imageUrl = `${imagePath}`;

    const newSubCategory = new SubCategories({
      CategoriesId: category._id,
      SubCategoriesName: req.body.SubCategoriesName,
      image: {
        fileName: req.file.filename,
        fileAddress: req.file.filename,
        imageUrl: imageUrl
      }
    });

    await newSubCategory.save();

    return res.status(201).send({
      error_code: 200,
      message: 'Subcategory Created',
      subcategory: newSubCategory
    });
  } catch (err) {
    console.log('Error inside create SubCategory Controller', err);
    return res.status(500).send({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};


// --------------------------------------------------------


const updateSubCategories = async (req, res) => {
  try {
    const { subCatid, SubCategoriesName } = req.body;

    if (!subCatid) {
      return res.status(400).json({
        error_code: 400,
        message: "subCatid is required"
      });
    }

    if (!SubCategoriesName) {
      return res.status(400).json({
        error_code: 400,
        message: "SubCategoriesName is required"
      });
    }


    const updateObject = { SubCategoriesName };
    if (req.file) {
       const imagePath = `uploads/${req.file.filename}`;
      const imageUrl = `${imagePath}`;

      updateObject.image = {
        fileName: req.file.filename,
        fileAddress: req.file.path,
        imageUrl: imageUrl
      };
    }

    const updatedSubCategories = await SubCategories.findByIdAndUpdate(subCatid, updateObject, { new: true });

    if (!updatedSubCategories) {
      return res.status(404).json({
        error_code: 404,
        message: "SubCategories not found"
      });
    }

    return res.status(200).json({
      error_code: 200,
      message: "SubCategories updated",
      category: updatedSubCategories,
    });
  } catch (err) {
    console.error('Error inside update SubCategories Controller', err);
    return res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};

// ---------------------------------------

const deleteMany = async (req, res) => {
  try {
    const deleted = await Songs.deleteMany({});
    res.status(200).json({
      error_code: 200,
      message: 'All categories deleted successfully',
      deleted
    });
  } catch (err) {
    console.error('Error inside deleteMany Controller', err);
    res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};



const deleteSubCategories = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the subcategory
    const deletedSubCategories = await SubCategories.findByIdAndDelete(id);

    // Check if the subcategory exists
    if (!deletedSubCategories) {
      return res.status(404).send({
        error_code: 404,
        message: "SubCategories not found"
      });
    }

    // Return a success response
    return res.status(200).send({
      error_code: 200,
      message: "SubCategories deleted"
    });
  } catch (err) {
    console.log('Error inside delete SubCategories Controller', err);
    return res.status(500).send({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};

// ---------------------------------------------

// const getSubCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const skip = (page - 1) * limit;
//     const searchQuery = req.query.search || '';

//     const subcategories = await SubCategories.find({
//       SubCategoriesName: { $regex: searchQuery, $options: 'i' }
//     })
//       .populate('CategoriesId') // Populate the 'CategoriesId' field
//       .skip(skip)
//       .limit(limit);
//     const populatedSubcategories = subcategories.map(subcategory => ({
//       _id: subcategory._id,
//       SubCategoriesName: subcategory.SubCategoriesName,
//       image: subcategory.image,
//       status: subcategory.status,
//       CategoriesId: subcategory.CategoriesId ? subcategory.CategoriesId._id : null, // Reference the category ID if it exists
//       categoryName: subcategory.CategoriesId ? subcategory.CategoriesId.name : null // Display category name if it exists
//     }));
//     console.log("🚀 ~ populatedSubcategories ~ populatedSubcategories:", populatedSubcategories)

//     const totalCount = await SubCategories.countDocuments({
//       SubCategoriesName: { $regex: searchQuery, $options: 'i' }
//     });

//     res.status(200).json({
//       error_code: 200,
//       message: 'Subcategories retrieved successfully',
//       subcategories: populatedSubcategories,
//       total_count: totalCount,
//       page,
//       limit
//     });
//   } catch (err) {
//     console.error('Error inside get SubCategories Controller', err);
//     res.status(500).json({
//       error_code: 500,
//       message: 'Internal Server Error'
//     });
//   }
// };

// ---------------------------------

// const getSubCategoriessss = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const skip = (page - 1) * limit;
//     const searchQuery = req.query.search || '';

//     const matchQuery = {
//       SubCategoriesName: { $regex: searchQuery, $options: 'i' },
//       'CategoriesId.deleted': { $ne: true },
//       'deleted': { $ne: true }
//     };

//     console.log('Match Query:', matchQuery);

//     const subcategories = await SubCategories.aggregate([
//       { $match: matchQuery },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'CategoriesId',
//           foreignField: '_id',
//           as: 'category'
//         }
//       },
//       { $unwind: '$category' },
//       {
//         $project: {
//           _id: 1,
//           SubCategoriesName: 1,
//           status: 1,
//           categoryName: '$category.name',
//           image: 1  // Include the whole image object
//         }
//       },
//       { $skip: skip },
//       { $limit: limit },
//       { $group: { _id: null, subcategories: { $push: '$$ROOT' } } },
//       { $project: { subcategories: 1, totalCount: { $size: '$subcategories' } } }
//     ]);

//     if (!subcategories || subcategories.length === 0) {
//       return res.status(404).json({
//         error_code: 404,
//         message: 'No subcategories found'
//       });
//     }

//     const baseUrl = getBaseUrl(req);

//     // Add the full image URL to each subcategory
//     const subcategoriesWithFullImageUrl = subcategories[0].subcategories.map(subcategory => ({
//       ...subcategory,
//       image: {
//         ...subcategory.image,
//         imageUrl: subcategory.image && subcategory.image.imageUrl ? `${baseUrl}/${subcategory.image.imageUrl.replace(/\\/g, '/')}` : null
//       }
//     }));

//     const totalCount = subcategories[0].totalCount;

//     res.status(200).json({
//       error_code: 200,
//       message: 'Subcategories retrieved successfully',
//       subcategories: subcategoriesWithFullImageUrl,
//       total_count: totalCount,
//       page,
//       limit
//     });
//   } catch (err) {
//     console.error('Error inside get SubCategories Controller', err);
//     res.status(500).json({
//       error_code: 500,
//       message: 'Internal Server Error'
//     });
//   }
// };

const getSubCategoriessss = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';

     const matchQuery = {
      SubCategoriesName: { $regex: searchQuery, $options: 'i' },
      'CategoriesId.deleted': { $ne: true },
      'deleted': { $ne: true }
    };

    console.log('Match Query:', matchQuery);

     const subcategoriesData = await SubCategories.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'CategoriesId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          SubCategoriesName: 1,
          status: 1,
          categoryName: '$category.name',
          image: 1
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

     const totalCount = await SubCategories.countDocuments(matchQuery);

    if (!subcategoriesData || subcategoriesData.length === 0) {
      return res.status(404).json({
        error_code: 404,
        message: 'No subcategories found'
      });
    }

     const subcategoriesWithFullImageUrl = subcategoriesData.map(subcategory => {
       const imageUrl = subcategory.image?.imageUrl && subcategory.image.imageUrl.startsWith('http')
        ? subcategory.image.imageUrl
        : `${getBaseUrl(req)}/${subcategory.image?.imageUrl?.replace(/\\/g, '/')}`;

      return {
        ...subcategory,
        image: {
          ...subcategory.image,
          imageUrl: imageUrl || null
        },
        imageUrl: imageUrl || null
      };
    });

    res.status(200).json({
      error_code: 200,
      message: 'Subcategories retrieved successfully',
      subcategories: subcategoriesWithFullImageUrl,
      total_count: totalCount,
      page,
      limit
    });
  } catch (err) {
    console.error('Error inside get SubCategories Controller', err);
    res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};










// --------------------------------------------

const changeSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategoryData = await SubCategories.findById(id);
    if (!subCategoryData) {
      return res.status(400).send({
        error_code: 400,
        message: 'Ads not found'
      });
    }

    subCategoryData.status = subCategoryData.status === 'activate' ? 'deactivate' : 'activate';

    await subCategoryData.save();
    res.status(200).send({
      message: `ads status toggled successfully to ${subCategoryData.status}`,
      subCategoryData: subCategoryData
    });
  } catch (err) {
    console.error('Error inside update admin', err);
    res.status(500).send({
      error_code: 500,
      message: 'Internal Server Error'

    });
  }
};

const getCategories = async (req, res) => {
  try {
    const { CategoriesId } = req.params;


    const categories = await SubCategories.find({ CategoriesId: CategoriesId });
    // console.log("🚀 ~ getCategories ~ categories:", categories)
    if (!categories || categories.length === 0) {
      return res.status(400).send({
        error_code: 400,
        message: 'Categories not found for the given category ID'
      });
    }

    // Return the found categories
    res.status(200).json({
      error_code: 200,
      message: 'Categories retrieved successfully',
      categories: categories
    });

  } catch (err) {
    console.error('Error inside getCategories', err);
    res.status(500).send({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};

// ------------------------------------------------

// const getSubCategoriesfromCategory = async (req, res) => {
//   try {
//     const { CategoriesId } = req.params;

//     const categories = await SubCategories.find({ CategoriesId: CategoriesId });

//     if (!categories || categories.length === 0) {
//       return res.status(400).json({
//         error_code: 400,
//         message: 'Categories not found for the given category ID'
//       });
//     }

//     const categoriesWithImageUrl = categories.map(category => ({
//       _id: category._id,
//       SubCategoriesName: category.SubCategoriesName,
//       imageUrl: category.image ? category.image.imageUrl : null,
//       status: category.status,
//       CategoriesId: category.CategoriesId,
//       categoryName: category.categoryName
//     }));

//     res.status(200).json({
//       error_code: 200,
//       message: 'Categories retrieved successfully',
//       categories: categoriesWithImageUrl
//     });

//   } catch (err) {
//     console.error('Error inside getCategories', err);
//     res.status(500).json({
//       error_code: 500,
//       message: 'Internal Server Error'
//     });
//   }
// };

const getSubCategoriesByIdddd = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is provided
    if (!id) {
      return res.status(400).json({
        error_code: 400,
        message: 'SubCategory ID is required',
      });
    }

    // Fetch the subcategory by ID
    const subcategory = await SubCategories.findById(id).populate('CategoriesId');

    if (!subcategory) {
      return res.status(404).json({
        error_code: 404,
        message: 'SubCategory not found',
      });
    }

    // Get base URL
    const baseUrl = getBaseUrl(req);

    // Add full URL to imageUrl
    const subcategoryWithFullImageUrl = {
      ...subcategory.toObject(),
      image: {
        ...subcategory.image,
        imageUrl: subcategory.image && subcategory.image.imageUrl
          ? `${baseUrl}/${subcategory.image.imageUrl.replace(/\\/g, '/')}`
          : null,
      },
    };

    // Return the subcategory with the updated image URL
    res.status(200).json({
      error_code: 200,
      message: 'SubCategory retrieved successfully',
      subcategory: subcategoryWithFullImageUrl,
    });

  } catch (err) {
    console.error('Error inside getSubCategoriesById', err);
    res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error',
    });
  }
};


const getAllSubCategoriesOnly = async (req, res) => {
  try {
    // Fetch all subcategories
    const subcategories = await SubCategories.find();
    const baseUrl = getBaseUrl(req);

    // Check if there are any subcategories found
    if (!subcategories || subcategories.length === 0) {
      return res.status(404).json({
        error_code: 404,
        message: 'No subcategories found',
      });
    }

    // Map through the subcategories and update imageUrl with full URL
    const subcategoriesWithFullImageUrl = subcategories.map(subcategory => ({
      ...subcategory.toObject(),
      image: {
        ...subcategory.image,
        imageUrl: subcategory.image && subcategory.image.imageUrl
          ? `${baseUrl}/${subcategory.image.imageUrl.replace(/\\/g, '/')}`
          : null,
      }
    }));

    res.status(200).json({
      error_code: 200,
      message: 'Subcategories retrieved successfully',
      subcategories: subcategoriesWithFullImageUrl,
    });
  } catch (err) {
    console.error('Error inside getAllSubCategoriesOnly Controller', err);
    res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};


// ------------------------------------------------



module.exports = {
  createsubCategories,
  updateSubCategories,
  deleteSubCategories,
  getSubCategoriessss,
  deleteMany,
  changeSubCategoryStatus,
  getCategories,
  getSubCategoriesByIdddd,
  getAllSubCategoriesOnly
};

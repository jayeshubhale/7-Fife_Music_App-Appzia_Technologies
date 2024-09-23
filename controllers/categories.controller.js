const Category = require("../models/categories.model");
const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);
// const fullImageUrl = `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`;

const createCategories = async (req, res) => {
  try {
    // console.log(req.body)
    const name = req.body;

    if (!req.body.name) {
      return res.status(400).send({
        error_code: 400,
        message: "Category name is required",
      });
    }

    let obj = {
      name: req.body.name,
    };

    if (req.file) {
      obj["image"] = {
        fileName: req.file.filename,
        fileAddress: req.file.filename,
      };

      const imagePath = `uploads/${req.file.filename}`;
      const imageUrl = `${imagePath}`;
      obj["imageUrl"] = imageUrl;
    }

    const newCategory = await Category.create(obj);

    return res.status(201).send({
      error_code: 200,
      message: "Categories created",
      category: newCategory,
    });
  } catch (err) {
    console.log("Error inside create Categories Controller", err);
    return res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// ----------------------------------------------
const updateCategories = async (req, res) => {
  try {
    const categoryId = req.params.id;

    let category = await Category.findById(categoryId);

    if (!category) {
      return res.json({
        error_code: 404,
        message: "Category not found",
      });
    }

    if (req.body.categoriesName) {
      category.name = req.body.categoriesName;
    }

    if (req.file) {
      const imagePath = `uploads/${req.file.filename}`;
      const imageUrl = `${imagePath}`;
      category.imageUrl = imageUrl;
      category.image = {
        fileName: req.file.filename,
        fileAddress: req.file.path,
      };
    }

    const updatedCategory = await category.save();
    console.log("updateCategories ~ updatedCategory:", updatedCategory);

    return res.status(200).send({
      error_code: 200,
      message: "Category updated",
      category: updatedCategory,
    });
  } catch (err) {
    console.log("Error inside update Categories Controller", err);
    return res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// -------------------------------------------

const deleteCategories = async (req, res) => {
  try {
    const categoryId = req.params.id;
    // Find the category by id and remove it
    const deletedCategory = await Category.findByIdAndRemove(categoryId);

    // Check if the category exists
    if (!deletedCategory) {
      return res.status(404).send({
        error_code: 404,
        message: "Category not found",
      });
    }

    // Return success response with the deleted category
    return res.status(200).send({
      error_code: 200,
      message: "Category deleted",
      category: deletedCategory,
    });
  } catch (err) {
    console.log("Error inside delete Categories Controller", err);
    return res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const changeCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const CategoryData = await Category.findById(id);
    if (!CategoryData) {
      return res.status(400).send({
        error_code: 400,
        message: "Ads not found",
      });
    }

    CategoryData.status =
      CategoryData.status === "activate" ? "deactivate" : "activate";

    await CategoryData.save();
    res.status(200).send({
      message: `ads status toggled successfully to ${CategoryData.status}`,
      CategoryData: CategoryData,
    });
  } catch (err) {
    console.error("Error inside update admin", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const getcategoriesPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || "";

    const categories = await Category.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .skip(skip)
      .limit(limit);
    console.log("🚀 ~ getCategories ~ categories:", categories);

    const totalCount = await Category.countDocuments({
      name: { $regex: searchQuery, $options: "i" },
    });

    res.status(200).json({
      error_code: 200,
      message: "Categories fetched successfully",
      categories,
      total_count: totalCount,
      page,
      limit,
    });
  } catch (err) {
    console.error("Error inside getCategories Controller", err);
    res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// ------------------------------------------------

// const getCategories = async (req, res) => {
//   try {
//     const baseUrl = getBaseUrl(req);
//     console.log(baseUrl);
//     const categories = await Category.find({});
//     console.log(categories);
//     const categoriesWithFullImageUrl = categories.map((category) => ({
//       ...category.toObject(),
//       imageUrl: `${baseUrl}/${category.imageUrl.replace(/\\/g, "/")}`,
//     }));

//     res.status(200).json({
//       error_code: 200,
//       message: "Categories fetched successfully",
//       categories: categoriesWithFullImageUrl,
//     });
//   } catch (err) {
//     console.error("Error inside getCategories Controller", err);
//     res.status(500).json({
//       error_code: 500,
//       message: "Internal Server Error",
//     });
//   }
// };

const getCategories = async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    console.log(baseUrl);

    const categories = await Category.find({});
    console.log(categories);

    const categoriesWithFullImageUrl = categories.map((category) => {
      const imageUrl = category.imageUrl
        ? `${baseUrl}/${category.imageUrl.replace(/\\/g, "/")}`
        : null;

      return {
        ...category.toObject(),
        imageUrl: imageUrl,
      };
    });

    res.status(200).json({
      error_code: 200,
      message: "Categories fetched successfully",
      categories: categoriesWithFullImageUrl,
    });
  } catch (err) {
    console.error("Error inside getCategories Controller", err);
    res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID parameter is provided
    if (!id) {
      return res.status(400).json({
        error_code: 400,
        message: "ID is required",
      });
    }

    // Fetch category by ID
    const category = await Category.findById(id);

    // Check if category exists
    if (!category) {
      return res.status(404).json({
        error_code: 404,
        message: "Category not found",
      });
    }

    // Get base URL
    const baseUrl = getBaseUrl(req);

    // Construct the full image URL
    const categoryWithFullImageUrl = {
      ...category.toObject(),
      imageUrl: `${baseUrl}/${category.imageUrl.replace(/\\/g, "/")}`,
    };

    // Send response
    return res.status(200).json({
      error_code: 200,
      message: "Category fetched successfully",
      category: categoryWithFullImageUrl,
    });
  } catch (err) {
    // Handle other
    console.error("Error inside getCategoryById Controller", err);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCategories,
  updateCategories,
  deleteCategories,
  changeCategoryStatus,
  getCategories,
  getcategoriesPage,
  getCategoryById,
};

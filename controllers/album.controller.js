const Album = require("../models/album.model");
const SubCategories = require("../models/subcategories.model");
const Categories = require("../models/categories.model");
const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);
// const fullImageUrl = `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`;

const createAlbum = async (req, res) => {
  try {
    const { categoryId, subcategoryId, albumName, shortDescription } = req.body;

    if (!categoryId || !subcategoryId) {
      return res.status(400).json({
        error_code: 400,
        message: "Category ID and Subcategory ID are required",
      });
    }

    const subcategory = await SubCategories.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        error_code: 404,
        message: "Subcategory not found",
      });
    }

    const imagePath = `uploads/${req.file.filename}`;
    const imageUrl = `${imagePath}`;

    const obj = {
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      albumName,
      shortDescription,
      imageUrl: imageUrl,
      image: {
        fileName: req.file.filename,
        fileAddress: req.file.path,
      },
    };
    const album = await Album.create(obj);

    return res
      .status(201)
      .json({
        error_code: 200,
        message: "Album created successfully",
        album: album,
      });
  } catch (err) {
    console.error("Error inside CreateAlbum Controller", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal Server Error" });
  }
};

const deletMany = async (req, res) => {
  try {
    const albums = await Album.deleteMany({});

    return res
      .status(200)
      .json({
        error_code: 200,
        message: "Albums deleted successfully",
        albums: albums,
      });
  } catch (error) {
    console.error("Error inside DeleteMany Controller", error);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal Server Error" });
  }
};

// ----------------------------------------------------

// const createAlbum = async (req, res) => {
//     try {
//         const { categoryId, subcategoryId, albumName, shortDescription } = req.body;

//         // Check if categoryId and subcategoryId are provided
//         if (!categoryId || !subcategoryId) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: "Both Category ID and Subcategory ID are required"
//             });
//         }

//         // Check if the provided category and subcategory exist
//         const category = await Categories.findById(categoryId);
//         const subcategory = await SubCategories.findById(subcategoryId);
//         if (!category || !subcategory) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: "Category or Subcategory not found"
//             });
//         }

//         // Handle image upload
//         let image = undefined;
//         if (req.file) {
//             const baseUrl = `${req.protocol}://${req.get('host')}`;
//             const imagePath = `uploads/${req.file.filename}`;
//             const imageUrl = `${baseUrl}/${imagePath}`;
//             image = {
//                 fileName: req.file.filename,
//                 fileAddress: req.file.path,
//                 imageUrl: imageUrl
//             };
//         }

//         // Create album object
//         const albumObj = {
//             categoryId: categoryId,
//             subcategoryId: subcategoryId,
//             albumName,
//             shortDescription,
//             image
//         };

//         // Create album in the database
//         const album = await Album.create(albumObj);
//         console.log("🚀 ~ createAlbum ~ album:", album)
//         return res.status(201).json({ error_code: 200, message: "Album created successfully", album: album });
//     } catch (err) {
//         console.error("Error inside CreateAlbum Controller", err);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Internal Server Error"
//         });
//     }
// };

// ------------------------------------------------

// const updateAlbum = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { categoryId, subcategoryId, albumName, shortDescription } = req.body;

//         // Check if the album ID is provided
//         if (!id) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: "Album ID is required"
//             });
//         }

//         // Check if the required fields are present in the request body
//         if (!categoryId || !subcategoryId) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: "Category ID and Subcategory ID are required"
//             });
//         }

//         // Find the album by ID
//         const album = await Album.findById(id);
//         if (!album) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: "Album not found"
//             });
//         }

//         // Find the category and subcategory by their IDs
//         const category = await Categories.findById(categoryId);
//         const subcategory = await SubCategories.findById(subcategoryId);

//         // Check if the category and subcategory exist
//         if (!category || !subcategory) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: "Category or Subcategory not found"
//             });
//         }

//         // Update album fields
//         album.set({
//             categoryId,
//             subcategoryId,
//             albumName,
//             shortDescription,
//             image: req.file ? {
//                 fileName: req.file.filename,
//                 fileAddress: req.file.path
//             } : album.image // Retain existing image if no new file provided
//         });

//         // Save the updated album
//         await album.save();

//         return res.status(200).json({
//             error_code: 200,
//             message: "Album updated successfully",
//             album: album
//         });
//     } catch (err) {
//         console.error("Error inside UpdateAlbum Controller", err);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Internal Server Error"
//         });
//     }
// };

// -------------------------------------------

const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, subcategoryId, albumName, shortDescription } = req.body;

    if (!id) {
      return res.status(400).json({
        error_code: 400,
        message: "Album ID is required",
      });
    }

    if (!categoryId || !subcategoryId || !albumName || !shortDescription) {
      return res.status(400).json({
        error_code: 400,
        message:
          "Category ID, Subcategory ID, Album Name, and Short Description are required",
      });
    }

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({
        error_code: 404,
        message: "Album not found",
      });
    }

    const category = await Categories.findById(categoryId);
    const subcategory = await SubCategories.findById(subcategoryId);

    if (!category || !subcategory) {
      return res.status(404).json({
        error_code: 404,
        message: "Category or Subcategory not found",
      });
    }

    // Handle image upload and update imageUrl
    let imageUrl = album.imageUrl;
    if (req.file) {
      const imagePath = `uploads/${req.file.filename}`;
      imageUrl = `${imagePath}`;
    }

    // Update album object with all fields
    const updatedAlbum = {
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      albumName: albumName,
      shortDescription: shortDescription,
      imageUrl: imageUrl,
      image: req.file
        ? {
            fileName: req.file.filename,
            fileAddress: req.file.path,
          }
        : album.image,
    };

    // Save the updated album
    await Album.findByIdAndUpdate(id, updatedAlbum);

    return res.status(200).json({
      error_code: 200,
      message: "Album updated successfully",
      album: updatedAlbum,
    });
  } catch (err) {
    console.error("Error inside UpdateAlbum Controller", err);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// ------------------------------------------------------------------

const deleteAlbum = async (req, res) => {
  try {
    // Find the album by ID and delete it
    const deletedAlbum = await Album.findByIdAndDelete(req.params.id);

    if (!deletedAlbum) {
      return res.status(404).send({
        error_code: 404,
        message: "Album not found",
      });
    }

    return res.status(200).send({
      error_code: 200,
      message: "Album deleted successfully",
    });
  } catch (err) {
    console.log("Error inside DeleteAlbum Controller", err);
    return res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const changeAlbumStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const albumData = await Album.findById(id);
    if (!albumData) {
      return res.status(400).send({
        error_code: 400,
        message: "album not found",
      });
    }

    albumData.status =
      albumData.status === "activate" ? "deactivate" : "activate";

    await albumData.save();
    res.status(200).send({
      message: `ads status toggled successfully to ${albumData.status}`,
      albumData: albumData,
    });
  } catch (err) {
    console.error("Error inside update admin", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};


const getAlbums = async (req, res) => {
    try {
      // Pagination parameters
      const { page = 1, limit = 10, search: searchQuery = "" } = req.query;
      const skip = (page - 1) * limit;
      const baseUrl = getBaseUrl(req); // Get the base URL

      // Find albums with pagination and search
      const albums = await Album.find({
        $or: [
          { albumName: { $regex: searchQuery, $options: "i" } },
          { shortDescription: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .populate("categoryId")
        .populate("subcategoryId")
        .skip(skip)
        .limit(limit);

      const totalCount = await Album.countDocuments({
        $or: [
          { albumName: { $regex: searchQuery, $options: "i" } },
          { shortDescription: { $regex: searchQuery, $options: "i" } },
        ],
      });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        error_code: 200,
        message: "Albums retrieved successfully",
        data: albums.map((album) => {
          // Access the fileAddress from the image object
          const imageUrl = album.image && album.image.fileAddress
            ? `${baseUrl}/${album.image.fileAddress.replace(/\\/g, '/')}` // Construct the image URL
            : null; // Handle cases where fileAddress is not available

          return {
            _id: album._id,
            status: album.status,
            image: album.image,
            imageUrl: imageUrl, // Use constructed image URL
            albumName: album.albumName,
            shortDescription: album.shortDescription,
            category: album.categoryId ? album.categoryId.name : null,
            subcategory: album.subcategoryId
              ? album.subcategoryId.SubCategoriesName
              : null,
          };
        }),
        totalPages: totalPages,
        currentPage: page,
      });
    } catch (err) {
      console.log("Error inside GetAlbums Controller", err);
      return res.status(500).json({
        error_code: 500,
        message: "Internal Server Error",
      });
    }
  };




const allAlbums = async (req, res) => {
    try {
      const albums = await Album.find();
      const baseUrl = getBaseUrl(req);

      const albumsWithFullImageUrl = albums.map(album => ({
        ...album.toObject(),
        imageUrl: `${baseUrl}/${album.imageUrl.replace(/\\/g, '/')}`, // Fixed here

      }));

      return res.status(200).json({
        error_code: 200,
        message: "Albums fetched successfully",
        albums: albumsWithFullImageUrl,
      });
    } catch (error) {
      console.log("Error inside GetAlbums Controller", error);
      return res.status(500).json({
        error_code: 500,
        message: "Internal Server Error",
      });
    }
  };






const getsubcategories = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const subCategories = await Album.find({ subcategoryId: subcategoryId });
    if (!subCategories || subCategories.length === 0) {
      return res.status(400).send({
        error_code: 400,
        message: "subCategories not found for the given subCategories ID",
      });
    }

    res.status(200).json({
      error_code: 200,
      message: "Categories retrieved successfully",
      subCategories: subCategories,
    });
  } catch (err) {
    console.error("Error inside getCategories", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error-",
    });
  }
};


const getAlbumSubid = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const { albumName } = req.query;
    const query = { subcategoryId: subcategoryId };

     if (albumName) {
      query.albumName = { $regex: albumName, $options: "i" };
    }

     const subCategories = await Album.find(query);

    if (!subCategories || subCategories.length === 0) {
      return res.status(400).send({
        error_code: 400,
        message: "No albums found for the given subcategory ID or album name",
      });
    }

    res.status(200).json({
      error_code: 200,
      message: "Albums retrieved successfully",
      subCategories: subCategories,
    });
  } catch (err) {
    console.error("Error inside getsubcategories", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};


module.exports = {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  changeAlbumStatus,
  getAlbums,
  allAlbums,
  deletMany,
  getsubcategories,
  getAlbumSubid
};

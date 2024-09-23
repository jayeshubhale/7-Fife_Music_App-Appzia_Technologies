const User = require("../models/user.model");
const constant = require("../util/constant");
const bcrypt = require("bcryptjs");
const objectConverter = require("../util/objectConverter");
const { getBaseUrl } = require("../configs/baseURL");

// const createAdmin = async (req, res) => {

//     try {
//         let user = await User.findOne({ userTypes: constant.userTypes.admin })

//         if (user) {
//             console.log('Admin Already Created', user);

//             return res.status(201).send({
//                 message: 'Admin already created'
//             });
//         }

//         let obj = {
//             email: req.body.email ? req.body.email : undefined,
//             password: req.body.password ? bcrypt.hashSync(req.body.password) : undefined,
//             userName: 'Admin',
//             userTypes: constant.userTypes.admin

//         }
//         if (req.file) {
//             const { filename, path } = req.file;
//             obj["image"] = {
//                 fileName: filename,
//                 fileAddress: path
//             }
//         }

//         console.log(obj);
//         await User.create(obj);
//         res.status(200).send({
//             errorCode: 200,
//             message: 'Admin Got Created'
//         })
//         console.log('Admin got created');

//     } catch (err) {
//         console.log(err);
//         res.status(500).send({
//             errorCode: 500,
//             message: 'Internal Error while creating Admin'
//         })
//     }
// }

const getList = async (req, res) => {
    try {
       const baseUrl = getBaseUrl(req);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skipIndex = (page - 1) * limit;
      const searchQuery = req.query.search || "";

      let obj = {
        userTypes: constant.userTypes.customer,
        otpVerifly: true,
      };

      if (searchQuery) {
        obj.$or = [
          { userName: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ];
      }

      const users = await User.find(obj).limit(limit).skip(skipIndex).lean();

      const totalCount = await User.countDocuments(obj);

      // Add baseUrl to imageUrl for each user
      const usersWithBaseUrl = users.map(user => {
        return {
          ...user,
          imageUrl: user.imageUrl ? `${baseUrl}/${user.imageUrl}` : '', // Add base URL to imageUrl
        };
      });

      return res.status(200).send({
        status: 200,
        message: "Users retrieved successfully",
        users: usersWithBaseUrl,
        total_users: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        current_page: page,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: 500,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  };


const update = async (req, res) => {
  try {
    const adminId = req.userId;
    const { firstName, lastName, address, mobileNo } = req.body;
    // console.log(req.body, "================================>");
    const admin = await User.findOne({ _id: adminId });

    if (!admin) {
      return res.status(404).json({
        error_code: 404,
        message: "Admin not found",
      });
    }
    const obj = {
      firstName: firstName,
      lastName: lastName,
      address: address,
      mobileNo: mobileNo,
    };
    // console.log("🚀 ~ update ~ obj:", obj)
    await User.findOneAndUpdate({ _id: adminId }, obj);
    const updatedAdmin = await User.findOne({ _id: adminId });
    // console.log("🚀 ~ update ~ updatedAdmin:", updatedAdmin)

    return res.status(200).json({
      error_code: 200,
      message: "Admin profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error inside update admin:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    // console.log("🚀 ~ updateProfile ~ adminId:", adminId);

    if (!adminId) {
      return res.status(404).json({
        error_code: 404,
        message: "Admin not found",
      });
    }

    const imagePath = `uploads/${req.file.filename}`;
    const imageUrl = `${imagePath}`;

    // Construct the updateFields object with the image details
    const updateFields = {
      image: {
        fileName: req.file.filename,
        fileAddress: imagePath,
      },
      imageUrl: imageUrl,
    };

    // Update the admin profile with the new image details
    const updatedAdmin = await User.findOneAndUpdate(
      { _id: adminId },
      updateFields,
      { new: true }
    );

    return res.status(200).json({
      error_code: 200,
      message: "Admin profile updated successfully",
      admin: {
        ...updatedAdmin.toObject(),
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error inside updateProfile:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const adminProfile = async (req, res) => {
    try {
      const adminId = req.userId;
    //   console.log("🚀 ~ adminProfile ~ adminId:", adminId);

      if (!adminId) {
        return res.status(404).json({
          error_code: 404,
          message: "Admin not found",
        });
      }

      const userData = await User.findOne({ _id: adminId }).lean();
      if (!userData) {
        return res.status(400).send({
          error_code: 400,
          message: "User not found",
        });
      }

      // Add baseUrl to imageUrl
      const baseUrl = getBaseUrl(req);
      const adminWithBaseUrl = {
        ...userData,
        imageUrl: userData.imageUrl ? `${baseUrl}${userData.imageUrl}` : '',
      };

      console.log("🚀 ~ adminProfile ~ userData:", adminWithBaseUrl);
      return res.status(200).send({
        error_code: 200,
        message: "Admin profile retrieved successfully",
        admin: adminWithBaseUrl,
      });
    } catch (error) {
      console.error("Error inside adminProfile:", error);
      return res.status(500).json({
        error_code: 500,
        message: "Internal Server Error",
      });
    }
  };


const userStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const userData = await User.findById(id);
    if (!userData) {
      return res.status(400).send({
        error_code: 400,
        message: "User not found",
      });
    }
    userData.status = userData.status === "Active" ? "Deactive" : "Active";

    await userData.save();

    res.status(200).send({
      message: `User status toggled successfully to ${userData.status}`,
      user: userData,
    });
  } catch (err) {
    console.error("Error inside update admin", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};


const changePassword = async (req, res) => {
  try {
      const userId = req.userId;

      const userData = await User.findOne({ _id: userId });
      if (!userData) {
          return res.status(404).json({
              error_code: 404,
              message: "User not found",
          });
      }

      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
          return res.status(400).json({
              error_code: 400,
              message: "New password and confirm password do not match",
          });
      }

      // Directly compare the old password
      if (userData.password !== oldPassword) {
          return res.status(400).json({
              error_code: 400,
              message: "Old password is incorrect",
          });
      }

      // Set the new password (ensure you know the security implications)
      userData.password = newPassword; // Store in plain text (not recommended)

      await userData.save();

      return res.status(200).json({
          message: "Password changed successfully",
          user: userData,
      });
  } catch (error) {
      console.error("Error inside changePassword controller", error);
      return res.status(500).json({
          error_code: 500,
          message: "Internal Server Error",
      });
  }
};

// ------------------------------------------------------

const getListUsers = async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    // Query to filter users with userTypes as 'Customer'
    const users = await User.find({ userTypes: 'Customer' });

    // Adding base URL to the imageUrl field for each user
    const usersWithBaseUrl = users.map(user => ({
      ...user._doc, // Spread all fields from the user document
      imageUrl: user.imageUrl ? `${baseUrl}/${user.imageUrl}` : '', // Add base URL to imageUrl
    }));

    return res.status(200).send({
      status: 200,
      data: usersWithBaseUrl, // Return the complete user data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};




module.exports = {
  // createAdmin,
  updateProfile,
  getList,
  adminProfile,
  update,
  userStatus,
  changePassword,
  getListUsers,
};

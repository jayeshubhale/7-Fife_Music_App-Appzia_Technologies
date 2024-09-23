const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const multer = require("multer");

const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
const constant = require("../util/constant");
const nodemailer = require("nodemailer");
const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);

const sendOTPByEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ay2087355@gmail.com",
        pass: "phbcdqcqdvsgdlsb",
      },
    });

    const mailOptions = {
      from: "checkdemo02@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

const signUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send({
        error_code: 400,
        message: "Password and confirm password do not match",
      });
    }

    let existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (existingUser.otpVerifly == true) {
        return res.status(401).send({
          error_code: 401,
          message: "Email already registered",
        });
      }

      if (existingUser.otpVerifly == false) {
        existingUser.password = password;
        // existingUser.password = bcrypt.hashSync(password, 8);
        existingUser.otp = generateOTP();

        await sendOTPByEmail(email, existingUser.otp);
        existingUser = await existingUser.save();

        return res.status(200).send({
          error_code: 200,
          message: "User registered successfully. ",
          email: email,
          otp: existingUser.otp,
        });
      }
    } else {
      const obj = {
        name: name,
        password: password,
        // password: bcrypt.hashSync(password, 8),
        email: email,
        registerWith: constant.registerWith.email,
        otp: generateOTP(),
      };

      await sendOTPByEmail(email, obj.otp);

      const user = await User.create(obj);
      return res.status(200).send({
        error_code: 200,
        message: "User registered successfully. ",
        email: email,
        otp: obj.otp,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error_code: 500,
      message: "Failed",
    });
  }
};

// const signUp = async (req, res) => {
//     try {
//         const obj = {
//             name: req.body.name,
//             password: bcrypt.hashSync(req.body.password, 8),
//             email: req.body.email,
//             registerWith: constant.registerWith.Email
//         }
//         const generateOTP = () => {
//             return Math.floor(10000 + Math.random() * 90000);
//         }

//         const email = req.body.email;
//         const otp = generateOTP();
//         obj['otp'] = otp;
//         const user = await User.create(obj);

//         const transporter = nodemailer.createTransport({
//             service: 'gmail', // e.g., 'Gmail'
//             auth: {
//                 user: 'ay2087355@gmail.com',
//                 pass: 'phbcdqcqdvsgdlsb'
//             }
//         });

//         const mailOptions = {
//             from: 'checkdemo02@gmail.com',
//             to: req.body.email, // The user's email
//             subject: 'Your OTP Code',
//             text: `Your OTP code is: ${otp}`
//         };

//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending OTP email:', error);
//                 return res.status(500).send({
//                     errorCode: 500,
//                     message: "Mail not Send"
//                 })
//             } else {
//                 console.log('OTP email sent:', info.response);
//             }
//         });

//         return res.status(201).send({
//             error_code: 200,
//             message: 'Success',
//             email: email,
//             otp: otp,
//         })
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({
//             error_code: 200,
//             message: 'Failed'
//         })
//     }
// }

// const signIn = async (req, res) => {
//     try {
//         console.log(req.body,"===================================>123")
//         const { email, password } = req.body;

//         if (!email){
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Email is required'
//             });
//         }
//         if (!password){
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Password is required'
//             });
//         }

//         const user = await User.findOne({ email });
//         console.log("🚀 ~ signIn ~ user:", user)
//         // console.log("🚀 ~ signIn ~ user:", user)

//         if (!user) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: 'User not found'
//             });
//         }
//         const isPasswordValid = bcrypt.compareSync(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 error_code: 401,
//                 message: 'Password is incorrect'
//             });
//         }

//         const token = jwt.sign({ id: user._id,userTypes:user.userTypes }, authConfig.secretKey, { expiresIn: '1h' });
//         console.log("🚀 ~ signIn ~ token:", token)

//         return res.status(200).json({
//             error_code: 200,
//             message: 'User logged in successfully',
//             accessToken: token
//         });
//     } catch (err) {
//         console.error('Error inside signIn:', err);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const signIn = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        error_code: 400,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    // Directly compare password with the stored password (ensure you know the security implications)
    if (user.password !== password) {
      // Assuming passwords are stored in plain text (not recommended)
      return res.status(401).json({
        error_code: 401,
        message: "Password is incorrect",
      });
    }

    if (user.otpVerifly === false) {
      return res.status(401).json({
        error_code: 401,
        message: "User has not been verified with OTP",
      });
    }

    const token = jwt.sign(
      { id: user._id, userTypes: user.userTypes },
      authConfig.secretKey,
      { expiresIn: "365d" }
    );
    // console.log("🚀 ~ signIn ~ token:", token)

    return res.status(200).json({
      error_code: 200,
      message: "User logged in successfully",
      accessToken: token,
    });
  } catch (err) {
    console.error("Error inside signIn:", err);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// const signIn = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const password = req.body.password;

//         if (!email || !password) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Email and password are required'
//             });
//         }

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: 'User not found'
//             });
//         }

//         const isPasswordValid = bcrypt.compareSync(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 error_code: 401,
//                 message: 'Password is incorrect'
//             });
//         }
//         if (user.otpVerifly === false) {
//             return res.status(401).json({
//                 error_code: 401,
//                 message: 'User has not been verified with OTP'
//             });
//         }

//         const token = jwt.sign({ id: user._id, userTypes: user.userTypes }, authConfig.secretKey, { expiresIn: '365d' });
//         // console.log("🚀 ~ signIn ~ token:", token)

//         return res.status(200).json({
//             error_code: 200,
//             message: 'User logged in successfully',
//             accessToken: token
//         });
//     } catch (err) {
//         console.error('Error inside signIn:', err);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

// const verifyOtp = async(req,res,next) => {
//     try{
//         const otp = req.body.otp;
//         const user = await User.findOne({_id:req.userId});
//         // console.log(user.otp,"otp");
//         if(user.otp!=otp){
//             return res.status(400).send({
//                 error_code : 400,
//                 message : 'otp is incorrect'
//             })
//         }
//         user.otpVerifly = true;
//         await user.save();
//         return res.status(200).send({
//             error_code : 200,
//             message : 'otp Verified'
//         })

//     }catch(err){
//         console.log('Error inside verifyOtp Controller',err);
//         return res.status(500).send({
//             message : 'Internal Error',
//             error_code : 500,
//         })
//     }
// }

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error_code: 400,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        error_code: 400,
        message: "Incorrect OTP",
      });
    }

    user.otpVerifly = true;
    await user.save();

    return res.status(200).json({
      error_code: 200,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verify OTP:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Failed",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    //   if (!existingUser.otpVerifly) {
    //     return res.status(400).json({
    //       error_code: 400,
    //       message: 'OTP verification is not enabled for this user'
    //     });
    //   }

    const newOTP = generateOTP();

    existingUser.otp = newOTP;
    await existingUser.save();

    await sendOTPByEmail(email, newOTP);

    return res.status(200).json({
      error_code: 200,
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.error("Error inside resendOTP:", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    await user.save();

    await sendOTPByEmail(email, otp);

    return res.status(200).json({
      error_code: 200,
      message: "OTP sent to user's email successfully",
      otp,
    });
  } catch (err) {
    console.error("Error inside forgotPassword:", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error_code: 400,
        message: "New password and confirm password do not match",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: email });

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    // Set the new password (in plain text, which is not secure)
    user.password = newPassword;
    await user.save();

    // Return a success message
    return res.status(200).json({
      error_code: 200,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Error inside resetPassword:", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal server error" });
  }
};

// const resetPassword = async (req, res) => {
//     try {
//         const { email, newPassword, confirmPassword } = req.body;

//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'New password and confirm password do not match'
//             });
//         }

//         const user = await User.findOne({ email: email });

//         if (!user) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: 'User not found'
//             });
//         }

//         user.password = bcrypt.hashSync(newPassword, 8);
//         await user.save();

//         return res.status(200).json({
//             error_code: 200,
//             message: 'Password reset successfully'
//         });
//     } catch (err) {
//         console.error('Error inside resetPassword:', err);
//         return res.status(500).json({ error_code: 500, message: 'Internal server error' });
//     }
// };

// ------------------------------------------------

const userProfile = async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    console.log(baseUrl);

    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    const userData = await User.findOne({ _id: userId });
    console.log("userData", userData.lastName);
    if (!userData) {
      return res.status(400).json({
        error_code: 400,
        message: "User not found",
      });
    }

    const name = `${userData.firstName || ""} ${
      userData.lastName || ""
    }`.trim();
    const email = userData.email;

    let imageUrl = "";
    if (userData.registerWith === "Email") {
      imageUrl = userData.imageUrl ? `${baseUrl}/${userData.imageUrl}` : "";
    } else if (
      userData.registerWith === "Google" ||
      userData.registerWith === "Facebook"
    ) {
      imageUrl = userData.imageUrl || "";
    }

    return res.status(200).json({
      error_code: 200,
      message: "User profile retrieved successfully",
      data: {
        name,
        email,
        imageUrl,
        userData,
      },
    });
  } catch (error) {
    console.error("Error inside userProfile:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// ------------------------------------------------

const userProfileUpdate = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({
        error_code: 404,
        message: "User not found",
      });
    }

    const imagePath = `uploads/${req.file.filename}`;
    const baseUrl = getBaseUrl(req);

    const user = await User.findOne({ _id: userId });

    let finalImageUrl;

    if (user.registerWith === "Google" || user.registerWith === "Facebook") {
      finalImageUrl = `${baseUrl}/${imagePath}`;
    } else if (user.registerWith === "Email") {
      finalImageUrl = imagePath;
    }

    const updateFields = {
      image: {
        fileName: req.file.filename,
        fileAddress: imagePath,
      },
      imageUrl: finalImageUrl,
    };

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      updateFields,
      { new: true }
    );

    return res.status(200).json({
      error_code: 200,
      message: "User profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        imageUrl: finalImageUrl,
      },
    });
  } catch (error) {
    console.error("Error inside userProfileUpdate:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// ------------------------------------------------------------

module.exports = {
  signIn,
  signUp,
  verifyOtp,
  resendOTP,
  forgotPassword,
  resetPassword,
  userProfile,
  userProfileUpdate,
};

// const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.config');
const bcrypt = require('bcryptjs');
const constant = require('../util/constant');
const Artist = require('../models/artist.model');
const Reward = require('../models/Reward.model');
const Song = require('../models/song.model');
const Album = require('../models/album.model')
const FavoriteSong = require('../models/favoriteSong');
const PlayList = require('../models/playlist.model');
const Category = require('../models/categories.model');
const axios = require('axios');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);
// const fullImageUrl = `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`;



const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000);
};

const sendOTPByEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ay2087355@gmail.com',
                pass: 'mqqqnoutaukxenlh'
            }
        });

        // Send OTP email
        await transporter.sendMail({
            from: 'checkdemo02@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`
        });

        console.log('OTP email sent successfully');
        return { success: true, message: 'OTP email sent successfully' };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, message: 'Failed to send OTP email' };
    }
}

const userRegister = async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        console.log("🚀 ~ userRegister ~ existingUser:", existingUser)
        if (existingUser) {
            return res.status(400).json({
                error_code: 400,
                message: 'Email already exists'
            });
        }

        // Generate OTP
        const otp = Math.floor(10000 + Math.random() * 90000);

        // Create user object with hashed password
        const user = await User.create({
            email: req.body.email,
            password: req.body.password,
            registerWith: constant.registerWith.Email,
            otp: otp,
            userName: req.body.userName,
            userType: constant.userTypes.customer
        });

         await sendOTPByEmail(user.email, otp);

        return res.status(200).json({
            error_code: 200,
            message: 'Success',
            user: user
        });
    } catch (err) {
        console.error('Error in user registration:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Failed'
        });
    }
};



const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error_code: 400,
                message: 'User not found'
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                error_code: 400,
                message: 'Incorrect OTP'
            });
        }

        user.otpVerified = true;
        await user.save();

        return res.status(200).json({
            error_code: 200,
            message: 'OTP verified successfully',
        });

    } catch (error) {
        console.error('Error in verify OTP:', error);
        return res.status(500).json({
            error_code: 500,
            message: 'Failed'
        });
    }
};

// --------------------------------------------------------------------


const createGoogle = async (req, res) => {
    try {
        console.log("Request body:", req.body);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract accessToken from request body
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: 'Access token is required' });
        }

        // Fetch user data from Google API
        let response;
        try {
            response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
        } catch (error) {
            return res.status(400).json({
                message: 'Invalid access token or failed to fetch user info from Google',
                error: error.message
            });
        }

        const userData = response.data;
        console.log("Google user data:", userData);

        // Check if JWT_SECRET is defined in environment
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in the environment variables');
            return res.status(500).json({ message: 'Internal Server Error: JWT_SECRET not configured' });
        }

        // Check if the user with this Google ID already exists
        let user = await User.findOne({ googleId: userData.id });

        // If the user doesn't exist by Google ID, check by email
        if (!user) {
            user = await User.findOne({ email: userData.email });
        }

        // If user exists, generate a JWT token and return the user data
        if (user) {
            const token = jwt.sign({ id: user._id, userType: user.userTypes }, process.env.JWT_SECRET, { expiresIn: '360d' });
            return res.status(200).json({
                message: 'User logged in successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName || userData.given_name,
                    lastName: user.lastName || userData.family_name,
                    email: user.email,
                    profilePicture: user.imageUrl || user.image?.fileAddress || userData.picture,
                    token,
                    status: user.status
                }
            });
        }

        // If user doesn't exist, create a new user
        const newUser = await User.create({
            email: userData.email,
            firstName: userData.given_name, // Google's first name
            lastName: userData.family_name, // Google's last name
            imageUrl: userData.picture,     // Google's profile picture URL
            registerWith: constant.registerWith.google,
            googleId: userData.id
        });

        console.log("New user created:", newUser);

        // Generate a JWT token for the new user
        const token = jwt.sign({ id: newUser._id, userType: newUser.userTypes }, process.env.JWT_SECRET, { expiresIn: '365d' } );

        // Return the new user data with token
        return res.status(201).json({
            message: 'New user created successfully',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                profilePicture: newUser.imageUrl || userData.picture,
                token,
                status: newUser.status
            }
        });
    } catch (error) {
        // Log the error and return 500 status code
        console.error('Error in createGoogle:', error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// --------------------------------------------------------------------


// const createGoogle = async (req, res) => {
//     try {
//         console.log("req.body", req.body);
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { accessToken } = req.body;

//         if (!accessToken) {
//             return res.status(400).json({
//                 message: 'Access token is required'
//             });
//         }

//         // Fetch user data from Google API
//         let response;
//         try {
//             response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
//         } catch (error) {
//             return res.status(400).json({
//                 message: 'Invalid access token or failed to fetch user info from Google',
//                 error: error.message
//             });
//         }

//         const userData = response.data;
//         console.log("userData", userData);

//         // Check if JWT_SECRET is defined
//         if (!process.env.JWT_SECRET) {
//             console.error('JWT_SECRET is not defined');
//             return res.status(500).json({ message: 'Internal Server Error: JWT_SECRET not configured' });
//         }

//         // Check if the user with this Google ID already exists
//         let user = await User.findOne({ googleId: userData.id });

//         // If user with Google ID doesn't exist, check by email
//         if (!user) {
//             user = await User.findOne({ email: userData.email });
//         }

//         // If user exists, generate token and return response
//         if (user) {
//             const token = jwt.sign({ id: user._id, userType: user.userTypes }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             return res.status(200).json({
//                 message: 'User logged in successfully',
//                 user: {
//                     id: user._id,
//                     firstName: user.firstName,
//                     lastName: user.lastName,
//                     email: user.email,
//                     profilePicture: user.imageUrl || user.image.fileAddress,
//                     token: token,
//                     status: user.status
//                 }
//             });
//         }

//         // If user doesn't exist, create a new user
//         const newUser = await User.create({
//             email: userData.email,
//             firstName: userData.given_name,   // Mapping Google's given_name to firstName
//             lastName: userData.family_name,   // Mapping Google's family_name to lastName
//             imageUrl: userData.picture,       // Saving Google profile picture URL in imageUrl
//             registerWith: constant.registerWith.google,
//             googleId: userData.id,
//         });

//         console.log("New User Created:", newUser);  // Debugging line to ensure new user has imageUrl

//         // Generate token for the new user
//         const token = jwt.sign({ id: newUser._id, userType: newUser.userTypes }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Send response with new user data
//         return res.status(201).json({
//             message: 'New user created successfully',
//             user: {
//                 id: newUser._id,
//                 firstName: newUser.firstName,
//                 lastName: newUser.lastName,
//                 email: newUser.email,
//                 profilePicture: newUser.imageUrl || newUser.image.fileAddress,
//                 token: token,
//                 status: newUser.status
//             }
//         });
//     } catch (error) {
//         // Handle errors
//         console.error('Error inside createGoogle:', error);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

// --------------------------------------------------------------------

// const createGoogle = async (req, res) => {
//     try {
//         console.log("req.body", req.body);
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { accessToken } = req.body;

//         if (!accessToken) {
//             return res.status(400).json({
//                 message: 'Access token is required'
//             });
//         }

//         // Fetch user data from Google API
//         let response;
//         try {
//             response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
//         } catch (error) {
//             return res.status(400).json({
//                 message: 'Invalid access token or failed to fetch user info from Google',
//                 error: error.message
//             });
//         }

//         console.log("response", response.data);
//         const userData = response.data;

//         // Check if JWT_SECRET is defined
//         if (!process.env.JWT_SECRET) {
//             console.error('JWT_SECRET is not defined');
//             return res.status(500).json({ message: 'Internal Server Error: JWT_SECRET not configured' });
//         }

//         // Check if the user with this Google ID already exists
//         let user = await User.findOne({ googleId: userData.id });

//         // If user with Google ID doesn't exist, check by email
//         if (!user) {
//             user = await User.findOne({ email: userData.email });
//         }

//         // If user exists, generate token and return response
//         if (user) {
//             const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             return res.status(200).json({
//                 message: 'User logged in successfully',
//                 user: {
//                     _id: user._id,
//                     email: user.email,
//                     name: user.name,
//                     profilePic: user.profilePic,
//                     userType: user.userType,
//                     status: user.status,
//                     token: token,
//                 }
//             });
//         }

//         // If user doesn't exist, create a new user
//         const newUser = await User.create({
//             email: userData.email,
//             name: userData.name,
//             profilePic: userData.picture,
//             authenticationType: "GOOGLE",
//             googleId: userData.id,
//         });

//         // Generate token for the new user
//         const token = jwt.sign({ id: newUser._id, userType: newUser.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Send response with new user data
//         return res.status(201).json({
//             message: 'New user created successfully',
//             user: {
//                 _id: newUser._id,
//                 email: newUser.email,
//                 name: newUser.name,
//                 profilePic: newUser.profilePic,
//                 userType: newUser.userType,
//                 status: newUser.status,
//                 token: token,
//             }
//         });
//     } catch (error) {
//         // Handle errors
//         console.error('Error inside createGoogle:', error);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };





// --------------------------------------------------------------------

// const createGoogle = async (req, res) => {
//     try {
//         console.log("reqbody",req.body);
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.body.accessToken}`);
//         console.log("response",response);
//         const userData = response.data;

//         // Check if the user with this Google ID already exists
//         let user = await User.findOne({ googleId: userData.id });

//         // If user with Google ID doesn't exist, check by email
//         if (!user) {
//             user = await User.findOne({ email: userData.email });
//         }

//         // If user exists, generate token and return response
//         if (user) {
//             const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             return res.status(200).json({
//                 _id: user._id,
//                 email: user.email,
//                 token: token,
//                 userType: user.userType,
//                 status: user.status,
//                 message: 'User logged in successfully'
//             });
//         }

//         // If user doesn't exist, create a new user
//         const newUser = await User.create({
//             email: userData.email,
//             name: userData.name,
//             profilePic: userData.picture,
//             authenticationType: "GOOGLE",
//             googleId: userData.id,
//         });

//         // Generate token for the new user
//         const token = jwt.sign({ id: newUser._id, userType: newUser.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Send response with user data
//         return res.status(201).json({
//             _id: newUser._id,
//             email: newUser.email,
//             token: token,
//             userType: newUser.userType,
//             authenticationType: "GOOGLE",
//             status: newUser.status,
//             message: 'New user created and logged in successfully'
//         });
//     } catch (error) {
//         // Handle errors
//         console.error('Error inside createGoogle:', error);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

// ------------------------------------------------------

// const editProfile = async (req, res) => {
//     try {
//         const { name, email } = req.body;
//         const userId = req.userId;

//         const existingUser = await User.findOne({ email });
//         if (existingUser && existingUser._id.toString() !== userId) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Email is already registered by another user'
//             });
//         }
//         if (!name || !email) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Name and email are required'
//             });
//         }

//         await User.findOneAndUpdate({ _id: userId }, { name, email });
//         const otp = generateOTP();

//         const data = await sendOTPByEmail(email, otp);

//         console.log("🚀 ~ update ~ data:", data);
//         return res.status(200).json({
//             error_code: 200,
//             message: 'Name and email updated successfully. Confirmation email sent with OTP.',
//             data: data
//         });
//     } catch (error) {
//         console.error('Error updating user profile and sending email:', error);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const updateName = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;

        if (!name) {
            return res.status(400).json({
                error_code: 400,
                message: 'Name is required'
            });
        }

        await User.findOneAndUpdate({ _id: userId }, { firstName: name });

        return res.status(200).json({
            error_code: 200,
            message: 'Name updated successfully'
        });
    } catch (error) {
        console.error('Error updating user name:', error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const updateEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.userId;

        if (!email) {
            return res.status(400).json({
                error_code: 400,
                message: 'Email is required'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                error_code: 400,
                message: 'Email is already registered by another user'
            });
        }

        const otp = generateOTP();

        // Update OTP in the database for the current user
        await User.findByIdAndUpdate(userId, {email:email, otp: otp });

        // Send OTP to the user's email
        await sendOTPByEmail(email, otp);

        return res.status(200).json({
            error_code: 200,
            message: 'OTP sent to email for verification',
            otp: otp
        });
    } catch (error) {
        console.error('Error updating user email:', error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};






const passUpCreate = async (req, res) => {
    console.log(req.body.email);
    try {
        let email = req.body.email
        function generateRandomNumber() {
            const min = 100000; // Minimum value (inclusive)
            const max = 999999; // Maximum value (inclusive)
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

            const uppercaseLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Uppercase letter ASCII range: 65-90
            const lowercaseLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Lowercase letter ASCII range: 97-122
            const specialCharacter = String.fromCharCode(Math.floor(Math.random() * 15) + 33); // Special character ASCII range: 33-47

            const randomString = randomNumber.toString() + uppercaseLetter + lowercaseLetter + specialCharacter;

            // Shuffle the characters in the string
            const shuffledString = randomString.split('').sort(() => 0.5 - Math.random()).join('');

            return shuffledString;
        }

        // Usage example
        const TempPassword = generateRandomNumber();

        let obj = {
            password: TempPassword
        }
        const user = await User.findOneAndUpdate({ email: email }, { $set: obj });
        user.save();
        return res.status(201).send({
            error_code: 200,
            message: `Temporary Password is ${TempPassword} for this ${email}`
        })

    } catch (err) {
        console.log(err);
        return res.status(500).send({
            error_code: 500,
            message: 'Error in passUpCreate'
        })
    }
}

// ==========================================================


const createFacebook = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        var flag = 0;
        if (!user) {
            let obj = {
                email: req.body.email,
                registerWith: constant.registerWith.facebook
            }
            user = await User.create(obj);
            flag = 1

        }
        if (user.registerWith != constant.registerWith.facebook) {
            return res.status(400).send({
                error_code: 400,
                message: "Can't login Through facebook"
            });
        }

        let str = flag ? 'User Got Created' : 'User was already Created';

        const token = jwt.sign({ id: user._id }, authConfig.secretKey, {
            expiresIn: 600000
        });
        return res.status(201).send({
            error_code: 200,
            message: str,
            acessToken: token
        })

    } catch (err) {
        console.log(err);
        return res.status(500).send({
            error_code: 500,
            message: 'Error in creating user'
        })

    }
}


// ==========================================================

const deleteUser = async (req, res) => {
    try {
        let id = req.params.id;

        await User.deleteOne({ _id: id });
        return res.status(201).send({
            error_code: 200,
            message: 'User Deleted succefully'
        })


    }
    catch (err) {
        console.log('Error inside delete User controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'internal server error'
        })
    }
}

const getUserPlaylist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('playlist');
        console.log(user);
        return res.status(201).send(constant.arrayConverterName(user.playlist));
    } catch (err) {
        console.log('Error inside getUserPlaylist Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        })
    }
}

const favrioteSong = async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                error_code: 404,
                message: 'Song not found'
            });
        }

        const isFavorite = user.favoriteSongs.includes(songId);

        if (isFavorite) {
            user.favoriteSongs.pull(songId);
            await user.save();
            return res.status(200).json({
                error_code: 200,
                message: 'Song removed from favorites successfully',
                // song: {
                //     songId: song._id,
                //     songName: song.title,
                //     artistName: song.artistName,
                //     duration: song.duration
                // }
            });
        } else {
            user.favoriteSongs.push(songId);
            await user.save();
            return res.status(200).json({
                error_code: 200,
                message: 'Song added to favorites successfully',
                // song: {
                //     songId: song._id,
                //     songName: song.title,
                //     artistName: song.artistName,
                //     duration: song.duration
                // }
            });
        }
    } catch (err) {
        console.error('Error inside favrioteSong:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const getfavrioteSongs = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req); // Get the base URL from the request
        const userId = req.userId;

        const user = await User.findById(userId).populate({
            path: 'favoriteSongs',
            select: '_id title coverArtImage musicFile duration artistId',
            populate: { path: 'artistId', select: 'ArtistName' }
        });
        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const favoriteSongs = user.favoriteSongs.map(song => ({
            songId: song._id,
            title: song.title,
            coverArtImage: song.coverArtImage ? `${baseUrl}/${song.coverArtImage.imageUrl.replace(/\\/g, '/')}` : null,
            musicFile: song.musicFile ? `${baseUrl}/${song.musicFile.url.replace(/\\/g, '/')}` : null,
            duration: song.duration,
            artistNames: song.artistId.map(artist => artist.ArtistName.trim()).join(","),
        }));

        return res.status(200).json({
            error_code: 200,
            message: 'Favorite songs retrieved successfully',
            data: favoriteSongs
        });
    } catch (err) {
        console.error('Error inside getAllFavoriteSongs:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// const getfavrioteSongs = async (req, res) => {
//     try {
//         const userId = req.userId;

//         const user = await User.findById(userId).populate({
//             path: 'favoriteSongs',
//             select: '_id title coverArtImage musicFile duration artistId',
//             populate: { path: 'artistId', select: 'ArtistName' }
//         });
//         if (!user) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: 'User not found'
//             });
//         }

//         const favoriteSongs = user.favoriteSongs.map(song => ({
//             songId: song._id,
//             title: song.title,
//             coverArtImage: song.coverArtImage ? song.coverArtImage.imageUrl : null,
//             musicFile: song.musicFile ? song.musicFile.url : null,
//             duration: song.duration,
//             artistNames: song.artistId.map(artist => artist.ArtistName.trim()).join(","),
//         }));
//         console.log("🚀 ~ favoriteSongs ~ favoriteSongs:", favoriteSongs)

//         return res.status(200).json({
//             error_code: 200,
//             message: 'Favorite songs retrieved successfully',
//             data: favoriteSongs
//         });
//     } catch (err) {
//         console.error('Error inside getAllFavoriteSongs:', err);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const PlayedSong = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        console.log(baseUrl);
        let key = req.params.id;
        let userId = req.userId;
        const user = await User.findById(userId);

        const favoriteSong = user.favoriteSongs.includes(key);
        const playlist = await PlayList.findOne({ userId: userId, songs: { $in: [key] } });
        const isSongInPlaylist = !!playlist;
        const isSongInQueue = user.queue.includes(key);

        const song = await Song.findById(key).populate('artistId', 'ArtistName');

        // Update mostPlayedSongs count
        if (user.mostPlayedSongs[key]) {
            const updatedObj = { $set: { ['mostPlayedSongs.' + key]: (++user.mostPlayedSongs[key]) } };
            await User.findByIdAndUpdate(userId, updatedObj);
        } else {
            const updatedObj = { $set: { ['mostPlayedSongs.' + key]: 1 } };
            await User.findByIdAndUpdate(userId, updatedObj);
        }

        const musicLink = song.musicLink ? song.musicLink : null;
        const artistNames = song.artistId.map(ele => ele.ArtistName.trim()).join(',');

        // Include baseUrl in musicFile and coverArtImage
        const musicFile = song.musicFile ? `${baseUrl}/${song.musicFile.url}` : null;
        const coverArtImage = song.coverArtImage ? `${baseUrl}/${song.coverArtImage.imageUrl}` : null;

        return res.status(200).send({
            error_code: 200,
            message: 'Song is Played',
            data: {
                songId: song._id,
                title: song.title,
                coverArtImage: coverArtImage,
                musicFile: musicFile,
                artistNames: artistNames,
                musiclink: musicLink,
                karaokeFile: song.karaokeFile.karaokeUrl,
                lyrics: song.lyrics,
                duration: song.duration,
                isFavorite: favoriteSong,
                isInPlaylist: isSongInPlaylist,
                isSongInQueue: isSongInQueue
            }
        });
    } catch (err) {
        console.log('Error inside playedSong', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



// const PlayedSong = async (req, res) => {
//     try {
//         const baseUrl = getBaseUrl(req);
//         console.log(baseUrl);
//         let key = req.params.id;
//         let userId = req.userId;
//         const user = await User.findById(userId);

//         const favoriteSong = user.favoriteSongs.includes(key);
//         const playlist = await PlayList.findOne({ userId: userId, songs: { $in: [key] } });
//         const isSongInPlaylist = !!playlist;
//         const isSongInQueue = user.queue.includes(key);

//         const song = await Song.findById(key).populate('artistId', 'ArtistName');

//         if (user.mostPlayedSongs[key]) {
//             const updatedObj = { $set: { ['mostPlayedSongs.' + key]: (++user.mostPlayedSongs[key]) } };
//             await User.findByIdAndUpdate(userId, updatedObj);
//         } else {
//             const updatedObj = { $set: { ['mostPlayedSongs.' + key]: 1 } };
//             await User.findByIdAndUpdate(userId, updatedObj);

//         }
//         const musicLink = song.musicLink ? song.musicLink : null;
//         const artistNames = song.artistId.map(ele => ele.ArtistName.trim()).join(',');
//         return res.status(200).send({
//             error_code: 200,
//             message: 'Song is Played',
//             data: {
//                 songId: song._id,
//                 title: song.title,
//                 coverArtImage: song.coverArtImage.imageUrl,
//                 musicFile: song.musicFile ? song.musicFile.url : null,
//                 artistNames: artistNames,
//                 musiclink: musicLink,
//                 karaokeFile: song.karaokeFile.karaokeUrl,
//                 lyrics: song.lyrics,
//                 duration: song.duration,
//                 isFavorite: favoriteSong,
//                 isInPlaylist: isSongInPlaylist,
//                 isSongInQueue: isSongInQueue

//             }
//         });
//     } catch (err) {
//         console.log('Error inside playedSong', err);
//         return res.status(500).send({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const getmostPlayedSong = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        const user = await User.findById(req.userId);
        const mostPlayedSongIds = Object.keys(user.mostPlayedSongs).filter(songId => user.mostPlayedSongs[songId] > 3);

        const mostPlayedSongsData = await Song.find({ _id: { $in: mostPlayedSongIds } }).populate('artistId', 'ArtistName');

        const mostPlayedSongs = mostPlayedSongsData.map(song => ({
            songId: song._id,
            title: song.title,
            coverArtImage: song.coverArtImage ? `${baseUrl}/${song.coverArtImage.imageUrl.replace(/\\/g, '/')}` : null,
            musicFile: song.musicFile ? `${baseUrl}/${song.musicFile.url.replace(/\\/g, '/')}` : null,
            duration: song.duration,
            artistNames: song.artistId.map(artist => artist.ArtistName.trim()).join(","),
            playCount: user.mostPlayedSongs[song._id]
        })).sort((a, b) => b.playCount - a.playCount);

        return res.status(200).json({
            error_code: 200,
            message: 'Most played songs data retrieved successfully',
            data: mostPlayedSongs
        });
    } catch (err) {
        console.log('Error inside getmostPlayedSong:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
}


const followingArtist = async (req, res) => {
    try {
        const artistId = req.params.id;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                error_code: 404,
                message: 'User not found'
            });
        }

        // Check if the artist exists
        const artist = await Artist.findById(artistId);
        console.log("🚀 ~ followingArtist ~ artist:", artist)
        if (!artist) {
            return res.status(404).send({
                error_code: 404,
                message: 'Artist not found'
            });
        }

        const isFollowing = user.following.includes(artistId);

        if (isFollowing) {
            user.following.pull(artistId);
            artist.followers.pull(userId);
            await Promise.all([user.save(), artist.save()]);

            return res.status(200).send({
                error_code: 200,
                message: `You Unfollowed ${artist.ArtistName}`
            });
        } else {
            user.following.push(artistId);
            artist.followers.push(userId);
            await Promise.all([user.save(), artist.save()]);

            return res.status(200).send({
                error_code: 200,
                message: `You followed ${artist.ArtistName}`
            });
        }
    } catch (err) {
        console.error('Error inside following Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const followedArtistData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('following');

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const followedArtists = user.following.map(artist => ({
            _id: artist._id,
            ArtistName: artist.ArtistName,
            imageUrl: artist.imageUrl,
        }));

        return res.status(200).json({
            error_code: 200,
            message: 'Followed artists data retrieved successfully',
            data: followedArtists
        });
    } catch (err) {
        console.error('Error inside followedArtistData:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const singleArtistData = async (req, res) => {
    try {
        const artistId = req.params.id;
        const artist = await Artist.findOne({ _id: artistId, status: 'activate' });
        const userId = req.userId;

        if (!artist) {
            return res.status(404).json({
                error_code: 404,
                message: 'Artist not found or is deactivated'
            });
        }

        const songs = await Song.find({ artistId: artistId });

        const followersCount = artist.followers.length;

        let isFollowing = false;
        if (userId) {
            isFollowing = artist.followers.includes(userId);
        }

        return res.status(200).json({
            error_code: 200,
            message: 'Artist and songs retrieved successfully',
            data: {
                artistName: artist.ArtistName,
                followers: followersCount,
                isFollowing: isFollowing,
                image: artist.imageUrl,
                songs: songs.map(song => ({
                    songId: song._id,
                    songName: song.title,
                    image: song.coverArtImage.imageUrl,
                    musicLink: song.musicLink,
                    musicFile: song.musicFile.url,
                    duration: song.duration
                }))
            }
        });
    } catch (err) {
        console.error('Error inside singleArtistData:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



// Function to calculate word alignment accuracy using Levenshtein distance


// Function to calculate timing accuracy


// Function to evaluate word alignment accuracy and timing accuracy
const evaluateAccuracy = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        const recognizedLyrics = req.recognizedLyrics;
        const originalLyrics = song.lyricsTimeStamp;
        const wordAlignmentAccuracy = constant.calculateWordAlignmentAccuracy(recognizedLyrics, originalLyrics);
        const timingAccuracy = constant.calculateTimingAccuracy(recognizedLyrics, originalLyrics);
        const totalAccuracy = (wordAlignmentAccuracy.toFixed(2) + timingAccuracy.toFixed(2)) / 2;
        console.log(totalAccuracy);
        var reward;
        switch (totalAccuracy) {
            case (totalAccuracy > 90):
                reward = 'A+';
                break;
            case (totalAccuracy > 80):
                reward = 'A'
                break;
            case (totalAccuracy > 70):
                reward = 'B+'
                break;
            case (totalAccuracy > 60):
                reward = 'B'
                break;
            case (totalAccuracy > 50):
                reward = 'C+'
                break;
            case (totalAccuracy > 40):
                reward = 'C'
                break;
            case (totalAccuracy < 40):
                reward = 'F'
                break;

        }

        const reward_score = await Reward.find({ score: reward });
        const user = await User.findById(req.userId);
        user.score += reward_score.reward;
        await user.save();
        console.log(user);
        return res.status(201).send({
            error_code: 200,
            Score: reward
        })

    } catch (err) {
        console.log('Error inside EvaluateAccuracy Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        })
    }
}

// const evaluateAccuracy = async (req, res) => {
//     try {
//         const song = await Song.findById(req.params.id);
//         console.log("🚀 ~ evaluateAccuracy ~ song:", song.lyrics);

//         const recognizedLyrics = req.body.recognizedLyrics;
//         console.log("🚀 ~ evaluateAccuracy ~ recognizedLyrics:", recognizedLyrics);

//         if (!Array.isArray(recognizedLyrics) || !Array.isArray(song.lyrics) || recognizedLyrics.length !== song.lyrics.length) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Recognized lyrics or original lyrics are invalid'
//             });
//         }

//         let correctWords = 0;
//         console.log("🚀 ~ evaluateAccuracy ~ correctWords:", correctWords)
//         let timingDifference = 0;
//         console.log("🚀 ~ evaluateAccuracy ~ timingDifference:", timingDifference)
//         const totalWords = recognizedLyrics.length;

//         for (let i = 0; i < totalWords; i++) {
//             const recognizedWord = recognizedLyrics[i]?.text?.toLowerCase();
//             const originalWord = song.lyrics[i]?.text?.toLowerCase();
//             const recognizedTime = recognizedLyrics[i]?.time;
//             const originalTime = song.lyrics[i]?.time;

//             if (recognizedWord === originalWord) {
//                 correctWords++;
//             }
//             console.log("🚀 ~ evaluateAccuracy ~ correctWords:", correctWords)

//             timingDifference += Math.abs(recognizedTime - originalTime);
//         }

//         const wordAlignmentAccuracy = (correctWords / totalWords) * 100;
//         console.log("🚀 ~ evaluateAccuracy ~ wordAlignmentAccuracy:", wordAlignmentAccuracy)

//         // Calculate timing accuracy, handle division by zero gracefully
//         const averageTimingDifference = totalWords > 0 ? timingDifference / totalWords : 0;
//         const timingAccuracy = totalWords > 0 ? 100 - (averageTimingDifference / song.lyrics[totalWords - 1].time) * 100 : 0;

//         // Calculate total accuracy
//         const totalAccuracy = isNaN(wordAlignmentAccuracy) || isNaN(timingAccuracy) ? NaN : ((wordAlignmentAccuracy + timingAccuracy) / 2).toFixed(2);
//         console.log("🚀 ~ evaluateAccuracy ~ totalAccuracy:", totalAccuracy);

//         let reward;
//         if (totalAccuracy > 90) {
//             reward = 'A+';
//         } else if (totalAccuracy > 80) {
//             reward = 'A';
//         } else if (totalAccuracy > 70) {
//             reward = 'B+';
//         } else if (totalAccuracy > 60) {
//             reward = 'B';
//         } else if (totalAccuracy > 50) {
//             reward = 'C+';
//         } else if (totalAccuracy > 40) {
//             reward = 'C';
//         } else {
//             reward = 'D';
//         }

//         const rewardScore = await Reward.findOne({ score: reward });
//         console.log("🚀 ~ evaluateAccuracy ~ rewardScore:", rewardScore);

//         if (!rewardScore) {
//             return res.status(404).json({ error_code: 404, message: 'Reward score not found' });
//         }

//         const user = await User.findById(req.userId);
//         if (!user) {
//             return res.status(404).json({ error_code: 404, message: 'User not found' });
//         }

//         user.score += rewardScore.reward;
//         await user.save();

//         return res.status(200).json({ error_code: 200, message: 'Song evaluated successfully', score: reward });
//     } catch (err) {
//         console.error('Error inside evaluateAccuracy Controller:', err);
//         return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
//     }
// };

const ranking = async (req, res) => {
    try {
        const ranking = await User.find({}).sort({ score: -1 }).limit(5);
        return res.status(201).send(ranking);

    } catch (err) {
        console.log('Error inside Ranking Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        })
    }
}

const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate the status value
        if (!['activate', 'deactivate'].includes(status)) {
            return res.status(400).send({
                error_code: 400,
                message: 'Invalid status value. Status must be either "activate" or "deactivate".'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({
                error_code: 404,
                message: 'User not found.'
            });
        }

        user.status = status;
        await user.save();

        return res.status(200).send({
            error_code: 200,
            message: `User status updated to ${status} successfully.`
        });
    } catch (err) {
        console.log('Error inside changeStatus controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal server error.'
        });
    }
}

const usergetAllSongs = async (req, res) => {
    try {
        const song = await Song.find({ status: 'Active' });
        return res.status(200).send(song);


    } catch (err) {
        console.log('Error inside changeStatus controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal server error.'
        });

    }
}

const newRelease = async (req, res) => {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 3);
        const songs = await Song.find({
            status: 'activate',
            createdAt: { $gte: fiveDaysAgo }
        });

        return res.status(200).send({ error_code: 200, message: 'new realese songs', song: songs });

    } catch (err) {
        console.log('Error inside newRelease controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal server error.'
        });
    }
}



const homeData = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        console.log(baseUrl);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const searchFilter = search ? {
            $or: [
                { 'title': { $regex: search, $options: 'i' } },
                { 'album.albumName': { $regex: search, $options: 'i' } },
                { 'artists.ArtistName': { $regex: search, $options: 'i' } }
            ]
        } : {};

        const pipeline = [
            {
                $match: { status: 'activate' }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subcategoryId',
                    foreignField: '_id',
                    as: 'subcategory'
                }
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artistId',
                    foreignField: '_id',
                    as: 'artists'
                }
            },
            {
                $lookup: {
                    from: 'albums',
                    localField: 'albumId',
                    foreignField: '_id',
                    as: 'album'
                }
            },
            {
                $match: searchFilter
            },
            {
                $group: {
                    _id: {
                        categoryId: '$categoryId',
                        categoryName: { $arrayElemAt: ['$category.name', 0] },
                        subcategoryId: '$subcategoryId',
                        subcategoryName: { $arrayElemAt: ['$subcategory.SubCategoriesName', 0] },
                        categoryImage: { $first: '$category.imageUrl' },
                        subcategoryImage: { $first: '$subcategory.image.imageUrl' }
                    },
                    categoryName: { $first: { $arrayElemAt: ['$category.name', 0] } },
                    subcategoryName: { $first: { $arrayElemAt: ['$subcategory.SubCategoriesName', 0] } },
                    data: {
                        $push: {
                            songId: '$_id',
                            title: '$title',
                            duration: '$duration',
                            musicFile: { $concat: [baseUrl,"/",'$musicFile.fileAddress'] },
                            coverArtImage: { $concat: [baseUrl,"/",'$coverArtImage.imageUrl'] },
                            artistNames: {
                                $reduce: {
                                    input: '$artists.ArtistName',
                                    initialValue: '',
                                    in: {
                                        $cond: [
                                            { $eq: ['$$value', ''] },
                                            '$$this',
                                            { $concat: ['$$value', ', ', '$$this'] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        categoryId: '$_id.categoryId',
                        categoryName: '$categoryName',
                        categoryImage: '$_id.categoryImage'
                    },
                    categoryName: { $first: '$_id.categoryName' },
                    categoryImage: { $first: { $concat: [baseUrl,"/",'$_id.categoryImage'] } },
                    subcategories: {
                        $addToSet: {
                            subcategoryName: '$_id.subcategoryName',
                            subcategoryImage: { $concat: [baseUrl,"/",'$_id.subcategoryImage'] },
                            data: '$data'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoryName: 1,
                    subcategories: 1,
                    categoryImage: 1,
                }
            },
            {
                $sort: { '_id.categoryId': 1 }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: 'count' }]
                }
            },
        ];

        const categoriesWithSongs = await Song.aggregate(pipeline);
        // console.log("🚀 ~ homeData ~ categoriesWithSongs:", categoriesWithSongs)

        const totalCount = categoriesWithSongs[0].totalCount.length > 0 ? categoriesWithSongs[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            error_code: 200,
            message: 'Songs grouped by category retrieved successfully',
            searchData: categoriesWithSongs[0].paginatedResults,
            pagination: {
                totalResults: totalCount,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit
            }
        });

    } catch (err) {
        console.error('Error inside homeData:', err);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};


// const search = async (req, res) => {
//     try {
//         const baseUrl = getBaseUrl(req);
//         console.log(baseUrl);

//         const searchTerm = req.query.searchTerm;

//         if (!searchTerm || searchTerm.trim() === '') {
//             return res.status(200).json({ error_code: 200, message: 'No search term provided', data: [] });
//         }

//         const searchOptions = { $regex: searchTerm, $options: 'i' };

//         const songResults = await Song.find({ title: searchOptions })
//             .select('title musicLink duration coverArtImage artistId karaokeFile musicFile')
//             .lean()
//             .populate('artistId', 'ArtistName');
//         const artistResults = await Artist.find({ ArtistName: searchOptions })
//             .select('ArtistName imageUrl')
//             .lean();
//         const albumResults = await Album.find({ albumName: searchOptions })
//             .select('albumName imageUrl')
//             .lean();
//         console.log("🚀 ~ search ~ albumResults:", albumResults);

//         const results = [
//             {
//                 type: 'song',
//                 data: songResults.map(song => ({
//                     songId: song._id,
//                     songName: song.title,
//                     artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
//                     duration: song.duration,
//                     musicFile: `${baseUrl}/${song.musicFile.url}`, // Add baseUrl
//                     coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl}` // Add baseUrl
//                 }))
//             },
//             {
//                 type: 'artist',
//                 data: await Promise.all(artistResults.map(async artist => {
//                     const artistSongs = await Song.find({ artistId: artist._id })
//                         .select('title musicFile musicLink duration coverArtImage')
//                         .lean()
//                         .populate('artistId', 'ArtistName');
//                     const songsData = artistSongs.map(song => ({
//                         songId: song._id,
//                         songName: song.title,
//                         musicLink: song.musicLink,
//                         artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
//                         duration: song.duration,
//                         musicFile: `${baseUrl}/${song.musicFile.url}`, // Add baseUrl
//                         coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl}` // Add baseUrl
//                     }));
//                     return {
//                         ArtistName: artist.ArtistName,
//                         artistImage: `${baseUrl}/${artist.imageUrl}`, // Add baseUrl
//                         data: songsData
//                     };
//                 }))
//             },
//             {
//                 type: 'album',
//                 data: await Promise.all(albumResults.map(async album => {
//                     const albumData = await Song.find({ albumId: album._id })
//                         .select('title musicFile musicLink duration coverArtImage')
//                         .lean()
//                         .populate('artistId', 'ArtistName');
//                     const songsData = albumData.map(song => ({
//                         songId: song._id,
//                         songName: song.title,
//                         musicLink: song.musicLink,
//                         artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
//                         duration: song.duration,
//                         musicFile: `${baseUrl}/${song.musicFile.url}`, // Add baseUrl
//                         coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl}` // Add baseUrl
//                     }));

//                     return {
//                         albumName: album.albumName,
//                         albumImage: `${baseUrl}/${album.imageUrl}`, // Add baseUrl
//                         data: songsData
//                     };
//                 }))
//             },
//         ];

//         return res.status(200).json({ error_code: 200, message: 'Search successful', data: results });
//     } catch (err) {
//         console.error('Error inside search:', err);
//         return res.status(500).json({ error_code: 500, message: 'Internal server error' });
//     }
// };



const search = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        const searchTerm = req.query.searchTerm;

        if (!searchTerm || searchTerm.trim() === '') {
            return res.status(200).json({ error_code: 200, message: 'No search term provided', data: [] });
        }

        // Split the search term into words for more flexible searching
        const searchWords = searchTerm.split(' ').filter(word => word.trim() !== '');

        // Create search conditions for title in the Song model
        const songSearchConditions = {
            $or: searchWords.map(word => ({
                title: { $regex: word, $options: 'i' }
            }))
        };

        // Search in songs
        const songResults = await Song.find(songSearchConditions)
            .select('title musicLink duration coverArtImage artistId karaokeFile musicFile')
            .lean()
            .populate('artistId', 'ArtistName');

        // Search in artists
        const artistResults = await Artist.find({
            $or: searchWords.map(word => ({ ArtistName: { $regex: word, $options: 'i' } }))
        })
            .select('ArtistName imageUrl')
            .lean();

        // Search for albums
        const albumResults = await Album.find({
            $or: searchWords.map(word => ({ albumName: { $regex: word, $options: 'i' } }))
        })
            .select('albumName imageUrl')
            .lean();

        // Format the results for songs
        const songData = songResults.map(song => ({
            songId: song._id,
            songName: song.title,
            artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
            duration: song.duration,
            musicFile: `${baseUrl}/${song.musicFile.url.replace(/\\/g, '/')}`, // Ensure correct URL format
            coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl.replace(/\\/g, '/')}` // Ensure correct URL format
        }));

        // Format the results for artists and include their songs
        const artistData = await Promise.all(artistResults.map(async artist => {
            const artistSongs = await Song.find({ artistId: artist._id })
                .select('title musicFile musicLink duration coverArtImage')
                .lean();
            const songsData = artistSongs.map(song => ({
                songId: song._id,
                songName: song.title,
                musicLink: song.musicLink,
                artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
                duration: song.duration,
                musicFile: `${baseUrl}/${song.musicFile.url.replace(/\\/g, '/')}`, // Ensure correct URL format
                coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl.replace(/\\/g, '/')}` // Ensure correct URL format
            }));
            return {
                ArtistName: artist.ArtistName,
                artistImage: `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`, // Ensure correct URL format
                data: songsData
            };
        }));

        // Format the results for albums and include their songs
        const albumData = await Promise.all(albumResults.map(async album => {
            const albumSongs = await Song.find({ albumId: album._id })
                .select('title musicFile musicLink duration coverArtImage')
                .lean();
            const songsData = albumSongs.map(song => ({
                songId: song._id,
                songName: song.title,
                musicLink: song.musicLink,
                artistNames: song.artistId ? song.artistId.map(artist => artist.ArtistName.trim()).join(",") : '',
                duration: song.duration,
                musicFile: `${baseUrl}/${song.musicFile.url.replace(/\\/g, '/')}`, // Ensure correct URL format
                coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl.replace(/\\/g, '/')}` // Ensure correct URL format
            }));

            return {
                albumName: album.albumName,
                albumImage: `${baseUrl}/${album.imageUrl.replace(/\\/g, '/')}`, // Ensure correct URL format
                data: songsData
            };
        }));

        // Return the final results with all types (songs, artists, albums)
        const results = [
            { type: 'song', data: songData },
            { type: 'artist', data: artistData },
            { type: 'album', data: albumData }
        ];

        return res.status(200).json({ error_code: 200, message: 'Search successful', data: results });
    } catch (err) {
        console.error('Error inside search:', err);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};


// --------------------------------------------------------

const songTypeData = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);

        const pipeline = [
            {
                $match: { status: 'activate' }
            },
            {
                $sort: { songType: 1 }
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artistId',
                    foreignField: '_id',
                    as: 'artists'
                }
            },
            {
                $group: {
                    _id: { $toUpper: "$songType" },
                    data: {
                        $push: {
                            songId: "$_id",
                            title: "$title",
                            duration: "$duration",
                            musicLink: "$musicLink",
                            musicFile: {
                                $concat: [baseUrl, "/", { $replaceAll: { input: "$musicFile.fileAddress", find: "\\", replacement: "/" } }]
                            },
                            coverArtImage: {
                                $concat: [baseUrl, "/", { $replaceAll: { input: "$coverArtImage.imageUrl", find: "\\", replacement: "/" } }]
                            },
                            artistNames: {
                                $reduce: {
                                    input: '$artists',
                                    initialValue: '',
                                    in: {
                                        $cond: [
                                            { $eq: ['$$value', ''] },
                                            '$$this.ArtistName',
                                            { $concat: ['$$value', ', ', '$$this.ArtistName'] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: { "_id": 1 } // Sort the data by songType
            }
        ];

        const categoriesWithSongs = await Song.aggregate(pipeline);

        const formattedData = categoriesWithSongs.map(category => ({
            songType: category._id,
            data: category.data
        }));

        return res.status(200).json({
            error_code: 200,
            message: 'Songs grouped by song type retrieved successfully',
            songTypeData: formattedData
        });
    } catch (err) {
        console.error('Error inside songTypeData:', err);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};


// const songTypeData = async (req, res) => {

//     try {

//     const baseUrl = getBaseUrl(req);

//         const pipeline = [
//             {
//                 $match: { status: 'activate' }
//             },
//             {
//                 $sort: { songType: 1 }
//             },
//             {
//                 $lookup: {
//                     from: 'artists',
//                     localField: 'artistId',
//                     foreignField: '_id',
//                     as: 'artists'
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $toUpper: "$songType" },
//                     data: {
//                         $push: {
//                             songId: "$_id",
//                             title: "$title",
//                             duration: "$duration",
//                             musicLink: "$musicLink",
//                             musicFile: { $concat: ["https://192.168.0.239:6200/", "$musicFile.fileAddress"] },
//                             coverArtImage: "$coverArtImage.imageUrl",
//                             artistNames: {
//                                 $reduce: {
//                                     input: '$artists',
//                                     initialValue: '',
//                                     in: {
//                                         $cond: [
//                                             { $eq: ['$$value', ''] },
//                                             '$$this.ArtistName',
//                                             { $concat: ['$$value', ', ', '$$this.ArtistName'] }
//                                         ]
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $sort: { "_id": 1 } // Sort the data by songType
//             }
//         ];

//         const categoriesWithSongs = await Song.aggregate(pipeline);

//         const formattedData = categoriesWithSongs.map(category => ({
//             songType: category._id,
//             data: category.data
//         }));

//         return res.status(200).json({
//             error_code: 200,
//             message: 'Songs grouped by song type retrieved successfully',
//             songTypeData: formattedData
//         });
//     } catch (err) {
//         console.error('Error inside songTypeData:', err);
//         return res.status(500).json({ error_code: 500, message: 'Internal server error' });
//     }
// };

// --------------------------------------------------------

const artistData = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req);
        console.log(baseUrl);
        const pipeline = [
            {
                $lookup: {
                    from: 'songs',
                    localField: '_id',
                    foreignField: 'artistId',
                    as: 'songs'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    ArtistName: '$ArtistName',
                    artistImage:  { $concat: [baseUrl,'/','$imageUrl'] },
                    data: {
                        $map: {
                            input: '$songs',
                            as: 'song',
                            in: {
                                songId: '$$song._id',
                                songName: '$$song.title',
                                coverArtImage: { $concat: [baseUrl,'/','$$song.coverArtImage.imageUrl'] },
                                musicLink: {
                                    $cond: {
                                        if: { $ne: ['$$song.musicLink', null] },
                                        then: '$$song.musicLink',
                                        else: null
                                    }
                                },
                                musicFile: {
                                    $cond: {
                                        if: { $ne: ['$$song.musicFile', null] },
                                        then: { $concat: [baseUrl,'/','$$song.musicFile.fileAddress'] },
                                        else: null
                                    }
                                },
                                duration: '$$song.duration',
                            }
                        }
                    }
                }
            }
        ];
        const artistsWithSongs = await Artist.aggregate(pipeline);

        return res.status(200).json({
            error_code: 200,
            message: 'Artist data with songs retrieved successfully',
            artistData: artistsWithSongs
        });
    } catch (error) {
        console.error('Error inside artistData:', error);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};



// const recommendedSongs = async (req, res, next) => {
//     try {
//         const user = await User.findById(req.userId);

//         if (!user) {
//             return res.status(404).json({ error_code: 404, message: 'User not found' });
//         }

//         let song;
//         let message;

//         if (user.queue.length === 0) {
//             const randomSong = await Song.aggregate([{ $sample: { size: 1 } }]);

//             if (randomSong.length === 0) {
//                 return res.status(404).json({ error_code: 404, message: 'No songs found' });
//             }

//             song = randomSong[0];
//             message = 'Random song retrieved successfully';
//         } else {
//             const firstQueueSongId = user.queue[0];
//             song = await Song.findById(firstQueueSongId);

//             if (!song) {
//                 return res.status(404).json({ error_code: 404, message: 'Queue song not found' });
//             }

//             user.queue.shift();
//             await user.save();

//             message = 'Queue song retrieved successfully';
//         }

//         let artistNames = '';
//         if (song.artistId) {
//             artistNames = song.artistId.map(ele => (ele.ArtistName ? ele.ArtistName.trim() : '')).join(',');
//         }
//         const { _id: songId, title, coverArtImage, musicFile, duration } = song;

//         const responseObject = {
//             songId,
//             title,
//             coverArtImage: coverArtImage?.imageUrl || null,
//             musicFile: musicFile?.url || null,
//             artistNames,
//             duration
//         };

//         return res.status(200).json({
//             error_code: 200,
//             message,
//             data: responseObject
//         });
//     } catch (error) {
//         console.error("====error==>>", error);
//         return next(error)
//     }
// };


const recommendedSongs = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        const { playlistId } = req.body;

        if (!user) {
            return res.status(404).json({ error_code: 404, message: 'User not found' });
        }

        let song;
        let message;
        if (playlistId) {
            const playlist = await PlayList.findById(playlistId);
            if (!playlist) {
                return res.status(404).json({ error_code: 404, message: 'Playlist not found' });
            }
            console.log(playlist, "==============>playlist");

            if (playlist.songs.length === 0) {
                return res.status(404).json({ error_code: 404, message: 'No songs in the playlist' });
            }
            const randomIndex = Math.floor(Math.random() * playlist.songs.length);
            const randomSongId = playlist.songs[randomIndex];
            song = await Song.findById(randomSongId);

            if (!song) {
                return res.status(404).json({ error_code: 404, message: 'Playlist song not found' });
            }

            message = 'Random song from the playlist retrieved successfully';
        } else if (user.queue.length > 0) {
            const firstQueueSongId = user.queue[0];
            song = await Song.findById(firstQueueSongId);

            if (!song) {
                return res.status(404).json({ error_code: 404, message: 'Queue song not found' });
            }
            user.queue.shift();
            await user.save();

            message = 'Queue song retrieved successfully';
        } else {
            const randomSong = await Song.aggregate([{ $sample: { size: 1 } }]);

            if (randomSong.length === 0) {
                return res.status(404).json({ error_code: 404, message: 'No songs found' });
            }

            song = randomSong[0];
            message = 'Random song retrieved successfully';
        }

        let artistNames = '';
        if (song.artistId) {
            artistNames = song.artistId.map(ele => (ele.ArtistName ? ele.ArtistName.trim() : '')).join(',');
        }
        const { _id: songId, title, coverArtImage, musicFile, duration } = song;

        const responseObject = {
            songId,
            title,
            coverArtImage: coverArtImage?.imageUrl || null,
            musicFile: musicFile?.url || null,
            artistNames,
            duration
        };

        return res.status(200).json({
            error_code: 200,
            message,
            data: responseObject
        });
    } catch (error) {
        console.error("====error==>>", error);
        return next(error);
    }
};


const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Success response
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    userRegister,
    verifyOTP,
    updateName,
    updateEmail,
    createGoogle,
    createFacebook,
    // editProfile,
    passUpCreate,
    getUserPlaylist,
    favrioteSong,
    deleteUser,
    PlayedSong,
    getmostPlayedSong,
    getfavrioteSongs,
    followingArtist,
    singleArtistData,
    followedArtistData,
    evaluateAccuracy,
    ranking,
    changeUserStatus, usergetAllSongs,
    newRelease,
    homeData,
    songTypeData,
    artistData,
    recommendedSongs,
    search,
    deleteUserById,
    // categoriesSongs
};
const regex = require('../regex');
const {User} = require('../../models/user.model')
const multer = require('multer');

const fieldCheck = async (req, res, next) => {
    try {

        if (!req.body.email || req.body.email.trim() === '') {
            return res.status(400).json({
                error_code: 400,
                message: 'Email not provided or empty'
            });
        }

        if (!req.body.password || req.body.password.trim() === '') {
            return res.status(400).json({
                error_code: 400,
                message: 'Password not provided or empty'
            });
        }

        if (!regex.emailRegex.test(req.body.email)) {
            return res.status(400).json({
                error_code: 400,
                message: 'Email format is incorrect'
            });
        }

        if (!regex.passRegex.test(req.body.password)) {
            return res.status(400).json({
                error_code: 400,
                message: 'Password format is incorrect'
            });
        }

        next();

    } catch (err) {
        console.error('Error inside auth Middleware fieldCheck:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



const uniqueEmail = async(req,res,next) => {
    try{
        const user = await User.findOne({email : req.body.email});
        if(user){
            return res.status(400).send({
                error_code : 400,
                message : 'Email already present'
            })
        }
        next();

    }catch(err){
        console.log('Error insdie auth mid email Present',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Error'
        })
    }
} 

const userCheckEmail = async (req,res,next) => {
    try{
    
         const user = await User.findOne({email : req.body.email});
         if(!user){
            return res.status(400).send({
                error_code : 400,
                message : 'User not present'
            })
         }
         next();
    }catch(err){
        return res.status(500).send({
            error_code : 500,
            message : 'Error inside userCheckEmail'
        })
    }
}

module.exports = {
    fieldCheck,
    uniqueEmail,
    userCheckEmail
}

const User = require('../models/user.model');





const bodyCheck = async (req, res, next) => {
    try {
        console.log(req.body);
        // Check if request body is undefined
        if (req.body === undefined) {
            return res.status(400).json({
                message: 'Empty request body'
            });
        }

        // Check if email is provided
        if (!req.body.email) {
            return res.status(400).json({
                message: 'Email not provided'
            });
        }

        // Validate email format
        if (!isValidEmail(req.body.email)) {
            return res.status(400).json({
                message: 'Invalid email format'
            });
        }

        // Check if password is provided
        if (!req.body.password) {
            return res.status(400).json({
                message: 'Password not provided'
            });
        }

        // Validate password format
        if (!isValidPassword(req.body.password)) {
            return res.status(400).json({
                message: 'Invalid password format'
            });
        }

        next();
    } catch (err) {
        console.error('Error inside bodyCheck:', err);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

const emailCheck = (req,res,next) => {
    if(!req.body.email){
        return res.status(401).send({
        message : 'Email not provided'
    })
}
    if(!isValidEmail(req.body.email)){
        return res.status(401).send({
            messsage : 'Email format Incorrect'
        })
    }
    next();
}

const userCheckEmail = async (req,res,next) => {
    try{
         const user = await User.findOne({email : req.body.email});
         if(!user){
            return res.status(404).send({
                message : 'User not present'
            })
         }
         next();
    }catch(err){
        return res.status(500).send({
            message : 'Error inside userCheckEmail'
        })
    }
}


const isValidEmail = (email)=>{ // checks valid email format
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

const isValidPassword = (password)=>{ // checks password meets requirements
    return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,25}$/);
}

module.exports = {
    bodyCheck,
    emailCheck,
    userCheckEmail
}


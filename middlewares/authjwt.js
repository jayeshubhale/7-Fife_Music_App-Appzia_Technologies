const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../configs/auth.config');

const verifyToken = (req,res,next)=>{
    const token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).send({
            error_code : 403,
            message : "no token provided! Access prohibited"
        })
    }

    jwt.verify(token, authConfig.secretKey, async (err, decoded)=>{
        if(err){
            return res.status(401).send({
                error_code : 400,
                message : "UnAuthorised!"
            })
        }
        req.userId = decoded.id;
        const user = await User.findOne({_id:req.userId});
        if(!user){
            return res.status(400).send({
                error_code : 400,
                message : "The user that this token belongs to does not exist"
            })
        }

        next();
    })
}

module.exports = {
    verifyToken
}
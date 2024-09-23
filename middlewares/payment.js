const User = require('../models/user.model');



const paymentBody = async(req,res,next) => {
    try{
        const user = await User.findById(req.userId);
        req.body['userName'] = user.userName

        next();


    }catch(err){
        console.log('Error inside paymentBody middleware',err);
        return res.status(500).send({
            message : 'Internal Server Error'
        })

    }
}

module.exports = {
    paymentBody
}
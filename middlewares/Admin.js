const User = require('../models/user.model');
const constant = require('../util/constant')

const isAdmin = async(req,res,next) => {
    try {
         let id = req.userId;
         const user = await User.findById(id);
         if(user.userTypes!= constant.userTypes.admin)
        return res.status(401).send({
            error_code : 400,
            message : 'Only Admin can access this field'
        })

        next();

    }
    catch(err)
    {
        console.log('error occured inside isAdmin',err);
        res.status(500).send({
            error_code : 500,
            message : err
        })
    }
}

module.exports = {
    isAdmin
}
const User = require('../models/user.model');
const constant = require('../util/constant')
const AdminOrOwner = async(req,res,next)=> {
    try{
        let id = req.params.id;
        const user = await User.findById(req.userId);
        if(user._id == id || user.userTypes ==constant.userTypes.admin) return next();
        else{
            console.log('Only admin or user can access this field');
            return res.status(400).send({
                message : 'Invalid authorization'
            })
        }
      

    }catch(err){
         console.log('Error inside isAdminorUser',err);
         res.status(500).send({
            message : 'Internal Server Error'
         })
    }
}

module.exports = {
    AdminOrOwner
}
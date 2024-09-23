



const bodyCheck = async(req,res,next) => {
    try{
        if(!req.body.reward){
            return res.status(400).send({
                message : 'Provide reward value'
            })
        }
        if(!req.body.score){
            return res.status(400).send({
                message : 'Provide Score value'
            })
        }
        next();

    }catch(err){
        console.log('Error inside Bodycheck Middleware',err);
        return res.status(500).send({
            message : 'Internal Server Error'
        })
    }
}

module.exports = {
    bodyCheck
}



const secondConverter = async(req,res,next) => {
    try{
        
        if(req.body.adsTiming.seconds > 60){
            let seconds = req.body.adsTiming.seconds;
            minutes = Math.floor(seconds/60);
            seconds = seconds%60;
            console.log(typeof req.body.adsTiming.minutes)

            req.body.adsTiming.minutes = Number(req.body.adsTiming.minutes) + minutes;
            req.body.adsTiming.seconds = seconds;
        }

        next();

    }catch(err){
        console.log('Error inside SecondConveter Middleware',err);
        res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

module.exports = {
    secondConverter
}



const adsSetting = require('../models/adsSetting.model');
const objectGenerator = require('../util/adsSetting')


const createSetting = async(req,res) => {
    try{
        
        const present = await adsSetting.find({});
        let data = req.body
        console.log(present);
        if(present.length){
            return res.status(400).send({
                error_code : 400,
                message : "Can't be created"
            })
        }

        let obj = {
            adsTiming : {
                  minutes : req.body.adsTiming.minutes? req.body.adsTiming.minutes : undefined,
                  seconds : req.body.adsTiming.seconds ? req.body.adsTiming.seconds : undefined
            },
            adsStatus : req.body.adsStatus ? req.body.adsStatus : undefined,
        }
        console.log(obj);   
        const setting = await adsSetting.create(obj);
        console.log(setting);
        res.status(201).send({
            error_code : 200,
            message : 'AdsSetting got Configured'
        })

    }catch(err) {
        console.log('Error inside CreatSetting Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const getSetting = async(req,res) => {
    try{
        const setting = await adsSetting.find({});
        return res.status(200).send(objectGenerator.adsSettingGenerator(setting))

    }catch(err){
        console.log('Error inside getSetting Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const updateSetting = async(req,res) => {
    try{
        let id = req.params.id ; 
        const setting = await adsSetting.findById(id);

        let obj = {
            adsTiming : {
                  minutes : req.body.adsTiming.minutes? req.body.adsTiming.minutes : undefined,
                  seconds : req.body.adsTiming.seconds ? req.body.adsTiming.seconds : undefined
            },
            adsStatus : req.body.adsStatus ? req.body.adsStatus : undefined,
        }

        await setting.updateOne(obj);
        await setting.save();
        return res.status(201).send({
            error_code : 200,
            message : 'Setting got updated'
        })
    

    }catch(err){
        console.log('Error inside updateSetting Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : "Internal server Error"
        })
    }
}



module.exports = {
    createSetting,
    getSetting,
    updateSetting
}
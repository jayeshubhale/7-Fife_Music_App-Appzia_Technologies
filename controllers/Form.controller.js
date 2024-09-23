
const Form = require('../models/Form.model');
const constant = require('../util/form.constant')

const create  = async(req,res) => {
    try {
        let obj = 
        {
            userName : req.body.userName ? req.body.userName : undefined,
            email  :req.body.email ? req.body.email : undefined,
            subject : req.body.subject ? req.body.subject : undefined,
            message : req.body.message ? req.body.message : undefined
        }
           await Form.create(obj);
           return res.status(201).send({
            error_code : 200,
            message : 'Form got created'
           })
    }catch(err){
        console.log('Error inside createform controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}
const updateForm = async(req,res) => {
    try{
        let id = req.params.id
        const form = await Form.findById(id)
         let obj = {
            reply : req.body.reply ? req.body.reply : undefined
         }
         await form.updateOne(obj);
         return res.status(201).send({
            error_code : 200,
            message : 'Form got updated'
         })
    }catch(err){
        console.log('Error inside updateFrom controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const getForm = async(req,res) => {
    try{
        let obj= {};
        if(req.query.userName){
           obj['userName'] = req.query['userName'];
        }
            
        const form = await Form.find(obj);
        console.log(form);
        return res.status(201).send(constant.objectConverter(form));

    }
    catch(err){
        console.log('Error inside getForm',err);
        return res.status(201).send({
            error_code : 200,
            message : 'Internal server Error'
        })
    }
}

module.exports = {
    create,
    updateForm,
    getForm
}
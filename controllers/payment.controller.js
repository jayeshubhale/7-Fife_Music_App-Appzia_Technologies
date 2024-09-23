const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const constant = require('../util/payment.constant');


const createPayment = async(req,res) => {
    try{
        const subscription = await Subscription.findById(req.params.id);
        
        let obj = {
            userName : req.body.userName,
            planName : subscription.subscriptionTitle,
            mainAmount : Math.floor((subscription.price*100)/(100-subscription.offer)),
            offer : subscription.offer + '%',
            finalAmount : subscription.price,
            paymentId : '#' + Math.floor(Math.random() * 100000)+1 ,
            paymentMethod : req.body.paymentMethod
        }
        await Payment.create(obj);
        res.status(201).send({
            error_code : 200,
            message : 'Payment has been created '
        })

    }catch(err){
          console.log('Error inside createPayment',err);
          res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
          })
    }
}


const getPayment = async(req,res) => {
    try{
        
        let obj = {
            userName : req.query.userName ? req.query.userName : undefined
        }
        console.log(obj);
        const payment = await Payment.find(obj);
        console.log(payment)
        return res.status(200).send(constant.objectConverter(payment));

    }catch(err){
        console.log('Error inside getReview controller',err);
        return res.status(500).send({
            error_code : 500,
            message : "Internal Server Error"
        })
    }
}

const deletePayment = async(req,res) => {
    try{
        let id = req.params.id;
        await Payment.deleteOne({_id :id});
       return  res.status(201).send({
            error_code : 200,
            message : 'Payment got deleted'
        })

    }catch(err){
        console.log('Error inside deletePay Controller',err)
         return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
         })
    }
}


module.exports = {
    createPayment,
    getPayment,
    deletePayment
}


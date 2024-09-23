const Subscription = require('../models/subscription.model');
const subconstant = require('../util/subscriptionConstant');

const Create = async(req,res) => {
    try{
        let obj = {
            subscriptionTitle: req.body.subscriptionTitle || undefined,
            validity: {
                duration: req.body.validity && req.body.validity.duration ? req.body.validity.duration : undefined,
                count: req.body.validity && req.body.validity.count ? req.body.validity.count : undefined
            },
            price: req.body.price ? subconstant.priceCalculate(req.body.offer, req.body.price) : undefined,
            offer: req.body.offer || undefined,
            adfree: req.body.adfree || undefined,
            download: req.body.download || undefined,
            description: req.body.description || undefined,
        }
    
     
        const subscription = await Subscription.create(obj);
       // console.log(subscription);
        return res.status(200).send({
            error_code : 200,
            message  : 'Subscription got created',
            subscription:subscription
        })

    }catch(err){
        console.log('Error inside subscription create',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal server Error while creating subscription'
        })
    }
}


const getAllsubs = async (req,res) => {
    try
    { 
        let obj = {};
        const subs = await Subscription.find(obj);
        res.status(201).send(subconstant.getSubscription(subs));
    }
    catch(err){
        console.log('error inside update subscription controller',err);
        return res.status(500).send({
            error_code : 200,
            message : 'Internal Server Error'
        })
    }
}
const getsub = async (req,res) => {
    try
    {
        let obj = {};
        if(req.params.id){
            obj._id = req.params.id
        }
        const subs = await Subscription.find(obj);
        console.log('list of subscription',subs);
        return res.status(201).send(subconstant.getSubscription(subs));
    }
    catch(err){
        console.log('error inside update subscription controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const updatesub = async(req,res) => {
    try{
        if(req.body == undefined){
            return res.status(200).json({error_code : 400, message : 'Epmty Request Body'})
        }
        let id = req.params.id;
        const sub = await Subscription.findById(id);
        console.log(req.body,req.file);
        let obj = 
        {
            subscriptionTitle : req.body.subscriptionTitle ? req.body.subscriptionTitle : undefined,
            validity : {
                duration : req.body.validity.duration ? req.body.validity.duration : undefined,
                count : req.body.validity.count ? req.body.validity.count : undefined 
            },
            price : req.body.price ? req.body.price : undefined,
            description : req.body.description ? req.body.description : undefined,
            offer : req.body.offer ? req.body.offer : undefined,
            adfree : req.body.adfree ? req.body.adfree :undefined,
            description : req.body.description ? req.body.description : undefined,
            status : req.body.status ? req.body.status : undefined,
            download : req.body.download ? req.body.download : undefined
        }
        if(req.body.offer){
            if(req.body.price)
            obj.price = subconstant.priceCalculate(req.body.offer,req.body.price);
            else{
                let originalPrice = Math.floor((sub.price*100)/(100-sub.offer));
                obj.price = subconstant.priceCalculate(req.body.offer,originalPrice)
            }
        }
        else if(!req.body.offer && req.body.price){
            obj.price = subconstant.priceCalculate(sub.offer,req.body.price)
        }
        await sub.updateOne(obj);
        console.log('subscription got updated',sub);
        return res.status(201).send({
                error_code : 200,
                message : 'subscription got updated'
        })


    } catch(err){
        console.log('Error inside update subscription controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const deletesub = async(req,res) => {
    try{
        let id = req.params.id;
        await Subscription.deleteOne({_id :id});
       return  res.status(201).send({
            message : 'subscription got deleted'
        })

    }catch(err){
         return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
         })
    }
};

const updateStatus = async function(req, res){
    try {
        let id = req.params.id;
       
        const sub = await Subscription.findById(id);
        if(sub.status == 'activate'){
            sub.status = 'deactivate'
        }else if(sub.status == 'deactivate'){
            sub.status = 'activate'
        }
        await sub.save()
        return res.status(200).json({error_code : 200, message : 'Status Update Successfully.'})
    } catch (error) {
        console.log(error);
        return res.status(50).json({ error_code : 500, message : 'Internal Server Error'})
    }
}

const getSingleSub = async (req, res) => {
    try {
        const subId = req.params.id;

        // Check if subscription ID is provided
        if (!subId) {
            return res.status(400).json({ error_code: 400, message: 'Subscription ID is required' });
        }

        // Find subscription by ID
        const subscription = await Subscription.findById(subId);

        // Check if subscription exists
        if (!subscription) {
            return res.status(404).json({ error_code: 404, message: 'Subscription not found' });
        }

        // Return the subscription details
        return res.status(200).json({ error_code: 200, subscription });
    } catch (error) {
        console.log('Error inside getSingleSub controller:', error);
        return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
    }
}

module.exports = {
    Create,
    getAllsubs,
    updatesub,
    deletesub,
    getsub,
    updateStatus,
    getSingleSub
}
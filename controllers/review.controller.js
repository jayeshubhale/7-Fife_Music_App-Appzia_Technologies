const User = require('../models/user.model');
const Review = require('../models/Review.model');
const constant = require('../util/review.constant')

const createReview = async(req,res)=> {
    try{
        const user = await User.findById(req.userId);
        let obj = {
            userName : user.userName,
            review : req.body.review ? req.body.review : undefined,
        }
        await Review.create(obj);
        return res.status(200).send({
            error_code : 200,
            message :'Review got Created'
        })

    }catch(err){
        console.log('Error inside createReview Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const getReview = async (req, res) => {
    try {
        let query = {};
        let pageNumber = req.query.pageNumber || 1; // Default to page 1 if pageNumber is not provided
        let pageSize = req.query.pageSize || 10; // Default page size to 10 if pageSize is not provided

        if (req.query.userName) {
            query.userName = req.query.userName;
        }

        const totalReviews = await Review.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / pageSize);

        const reviews = await Review.find(query)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return res.status(200).send({
            error_code : 200,
            message : 'Review retrieved successfully',
            total_reviews: totalReviews,
            total_pages: totalPages,
            current_page: pageNumber,
            data: constant.objectConverter(reviews)
        });
    } catch (err) {
        console.log('Error inside getReview controller', err);
        return res.status(500).send({
            error_code: 500,
            message: "Internal Server Error"
        });
    }
};


const updateReview = async(req,res) => {
    try{
        const review = await Review.findById(req.params.id);
        
        let obj = {
            reply : req.body.reply ? req.body.reply : undefined,
            status : req.body.status? req.body.status :undefined
        }
        await review.updateOne(obj);
        await review.save();
        return res.status(201).send({
            error_code : 200,
            message : 'Review got updated'
        })

    }catch(err){
        console.log('Error inside updateReview Controller',err);
        res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const deletereview = async(req,res) => {
    try{
        let id = req.params.id;
        await Review.deleteOne({_id :id});
       return  res.status(201).send({
            error_code : 200,
            message : 'review got deleted'
        })

    }catch(err){
        console.log('Error Occured inside deletereview of Review Controller',err);
         return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
         })
    }
}


const changeReviewStatus = async(req,res) =>{

    try{
        const { id}=req.params;
        const review = await Review.findById(id);
        if(!review){
            return res.status(400).send({
                error_code : 400,
                message : 'Review not found'
            })
        }
        review.status = review.status === 'publish'? 'unpublish' : 'publish';

        await review.save();
        return res.status(200).send({
            error_code : 200,
            message : 'Review status changed'
        })

    }catch(error){
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

module.exports = {
    createReview,
    changeReviewStatus,
    getReview,
    updateReview,
    deletereview
   
}
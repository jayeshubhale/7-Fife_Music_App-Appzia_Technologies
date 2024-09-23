const Reward = require('../models/Reward.model');



const createReward = async (req, res) => {
    try {
        const obj = {
            score: req.body.score,
            reward: req.body.reward
        };

        // Check if both score and reward are provided
        if (!obj.score || !obj.reward) {
            return res.status(400).send({
                error_code: 400,
                message: 'Score and reward are required fields'
            });
        }

        // Check if the reward score already exists
        const existingReward = await Reward.findOne({ score: obj.score });
        if (existingReward) {
            return res.status(400).send({
                error_code: 400,
                message: 'Reward score already exists'
            });
        }

        await Reward.create(obj);

        return res.status(201).send({
            error_code: 201,
            message: 'Reward created successfully'
        });
    } catch (err) {
        console.log('Error inside createReward Controller:', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


const updateReward = async(req,res) => {
    try{
        const reward = await Reward.findById(req.params.id);
        const obj = {
            reward : req.body.reward ? req.body.reward : undefined
        }
        await reward.updateOne(obj);
        await reward.save();
        return res.status(201).send({
            error_code : 200,
            message : 'Reward got updated'
        })

    }catch(err){
        console.log('Error inside updateReward',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const deleteReward = async(req,res) => {
    try{
        await Reward.deleteOne(req.params.id);
        return res.status(201).send({
            error_code : 200,
            message  : 'Reward got Deleted'
        })

    }catch(err){
        console.log('Error inside deleteReward Controller',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

const getReward = async(req,res) => {
    try{
          const rewardList = await Reward.find({});
          return res.status(201).send(rewardList);
    }catch(err){
        console.log('Error inside getRewardController',err);
        return res.status(500).send({
            error_code : 500,
            message : 'Internal Server Error'
        })
    }
}

module.exports = {
    createReward,
    updateReward,
    deleteReward,
    getReward,
}
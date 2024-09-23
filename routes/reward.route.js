const rewardController = require('../controllers/Reward.controller');
const authJwt = require('../middlewares/authjwt');
const admin = require('../middlewares/Admin');
const body = require('../middlewares/Reward');


// module.exports = (app) => {
//     app.post('/createreward',[authJwt.verifyToken,admin.isAdmin,body.bodyCheck],rewardController.createReward);
//     app.put('/updatereward/:id',[authJwt.verifyToken,admin.isAdmin],rewardController.updateReward);
//     app.delete('/deletereward/:id',[authJwt.verifyToken,admin.isAdmin],rewardController.deleteReward);
//     app.get('/getreward',[authJwt.verifyToken,admin.isAdmin],rewardController.getReward);
// }

module.exports = (app) => {
    app.post('/createreward', rewardController.createReward);
    app.put('/updatereward/:id',rewardController.updateReward);
    app.delete('/deletereward/:id',rewardController.deleteReward);
    app.get('/getreward',rewardController.getReward);
}
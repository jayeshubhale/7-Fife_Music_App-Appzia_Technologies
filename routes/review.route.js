const authJwt = require('../middlewares/authjwt');
const reviewController = require('../controllers/review.controller');
const admin = require('../middlewares/Admin');
const idchecker = require('../middlewares/idchecker');


module.exports = (app) => {
    app.post('/createReview', [authJwt.verifyToken],reviewController.createReview);
    app.get('/getReviews',[authJwt.verifyToken,admin.isAdmin],reviewController.getReview);
    app.put('/reviewUpdated/:id',[idchecker.idCheck,authJwt.verifyToken,admin.isAdmin],reviewController.updateReview)
    app.delete('/deletereview/:id',[idchecker.idCheck,authJwt.verifyToken,admin.isAdmin],reviewController.deletereview)
    app.put('/changeReviewStatus/:id',[idchecker.idCheck,authJwt.verifyToken,admin.isAdmin],reviewController.changeReviewStatus)
}
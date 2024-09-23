const adController = require('../controllers/Ads.controller');
// const idChecker = require('../middlewares/idchecker');
// const authJwt = require('../middlewares/authjwt');
// const AdminCheck = require('../middlewares/Admin')



module.exports = (app) => {
    app.post('/createad',adController.create);
    app.get('/getads', adController.getad);
    app.put('/updateAds/:id',adController.updateAds);
    app.delete('/deleteAds/:id',adController.deletead)
    app.put('/updateAdsTime/:id',adController.updateAdsTime);
    app.put('/updateAdsStatus/:id',adController.updateAdsStatus);
};
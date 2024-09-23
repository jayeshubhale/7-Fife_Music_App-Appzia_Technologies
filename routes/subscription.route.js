 
const subscriptionController = require('../controllers/subscription.controller');
const AdminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');
const idChecker = require('../middlewares/idchecker')


module.exports = (app) => {
    app.post('/createSubscription', [authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.Create);
    app.put('/update/:id', [idChecker.idCheck, authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.updatesub);
    app.get('/getsubscriptions', [authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.getAllsubs);
    app.get('/getsub/:id', [idChecker.idCheck, authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.getsub);
    app.delete('/deleteSubscription/:id', [idChecker.idCheck, authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.deletesub)
    app.put('/updateSubscriptionStatus/:id',[idChecker.idCheck, authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.updateStatus);
    app.get('/subscription/:id', [idChecker.idCheck, authJwt.verifyToken, AdminCheck.isAdmin], subscriptionController.getSingleSub);
}



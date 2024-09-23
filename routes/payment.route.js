const authJwt = require('../middlewares/authjwt');
const payment = require('../middlewares/payment');
const AdminCheck = require('../middlewares/Admin');
const paymentController = require('../controllers/payment.controller')


module.exports = (app) => {
    app.post('/buySubscription/:id',[authJwt.verifyToken,payment.paymentBody],paymentController.createPayment);
    app.get('/getPayment', [authJwt.verifyToken, AdminCheck.isAdmin], paymentController.getPayment);
    app.delete('/deletePayment/:id', [authJwt.verifyToken, AdminCheck.isAdmin], paymentController.deletePayment);
}
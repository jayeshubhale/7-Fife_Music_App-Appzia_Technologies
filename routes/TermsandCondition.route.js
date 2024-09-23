const TandCcontroller = require('../controllers/TermCondition.controller');
const authJwt = require('../middlewares/authjwt');
const admin = require('../middlewares/Admin')

module.exports = (app) => {
    app.post('/createTermsandCondition',[authJwt.verifyToken,admin.isAdmin],TandCcontroller.createTermsCondition);
    app.put('/updateController/:id',[authJwt.verifyToken,admin.isAdmin],TandCcontroller.updateTermsCondition);
}
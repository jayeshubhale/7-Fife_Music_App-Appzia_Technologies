const privacyController = require('../controllers/privacy.controller');
const authJwt = require('../middlewares/authjwt');
const admin = require('../middlewares/Admin')

module.exports = (app) => {
    app.post('/createprivacy',[authJwt.verifyToken,admin.isAdmin],privacyController.add_privacy_policy);
    app.put('/updateprivacy/:id',[authJwt.verifyToken,admin.isAdmin],privacyController.update_privacy_policy);
}

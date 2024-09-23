const settingController = require('../controllers/adsSetting.controller')
const conveterMiddleware = require('../middlewares/adsSetting');
const idChecker = require('../middlewares/idchecker');
const authJwt = require('../middlewares/authjwt');
const Admin = require('../middlewares/Admin')

module.exports = (app) => {
    app.post('/createSetting',[authJwt.verifyToken,Admin.isAdmin,conveterMiddleware.secondConverter],settingController.createSetting);
    app.get('/getSettingDetails',[authJwt.verifyToken,Admin.isAdmin],settingController.getSetting);
    app.put('/updateSetting/:id',[idChecker.idCheck,authJwt.verifyToken,Admin.isAdmin,conveterMiddleware.secondConverter],settingController.updateSetting)
}       
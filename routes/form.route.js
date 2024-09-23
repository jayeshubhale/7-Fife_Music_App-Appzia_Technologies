const authJwt = require('../middlewares/authjwt');
const formController = require('../controllers/Form.controller');
const Admin = require('../middlewares/Admin')
module.exports = (app) => {
    app.post('/createForm',[authJwt.verifyToken],formController.create)
    app.put('/updateForm/:id',[authJwt.verifyToken,Admin.isAdmin],formController.updateForm);
    app.get('/getForm/',[authJwt.verifyToken,Admin.isAdmin],formController.getForm)
    app.get('/getForm/:id',[authJwt.verifyToken,Admin.isAdmin],formController.getForm)
}
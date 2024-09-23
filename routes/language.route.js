const languageController = require('../controllers/language.controller');
const adminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');


module.exports = (app) => {
    app.post('/createlanguage',[authJwt.verifyToken, adminCheck.isAdmin], languageController.createLanguage);
    app.put('/updatelanguage/:id',[authJwt.verifyToken, adminCheck.isAdmin], languageController.updateLanguage);
    app.get('/getLanguage', [authJwt.verifyToken, adminCheck.isAdmin],languageController.getLanguage);
    app.delete('/deletelanguage/:id', [authJwt.verifyToken, adminCheck.isAdmin],languageController.deleteLanguage);
    app.put('/changelanguageStatus/:id',[authJwt.verifyToken, adminCheck.isAdmin], languageController.changeLanguageStatus);
    app.get('/getAllLanguage',[authJwt.verifyToken, adminCheck.isAdmin],languageController.getAllLanguage)

    
}

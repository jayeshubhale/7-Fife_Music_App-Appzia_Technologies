const reqBody = require('../middlewares/reqBody');
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/Admin.controller');
const adminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');
const multer = require('multer');


var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, "[image]-" + file.originalname);
  }
});

var upload = multer({
  storage: fileStorageEngine
})

module.exports = (app) => {

  // app.post('/admin/register',adminController.createAdmin);
  app.post('/admin/login', authController.signIn);
  app.get('/admin/getUserList', [authJwt.verifyToken, adminCheck.isAdmin], adminController.getList);
  app.get('/user/getUserList', [authJwt.verifyToken, adminCheck.isAdmin], adminController.getListUsers);
  app.put('/admin/updateProfile', [authJwt.verifyToken, adminCheck.isAdmin], adminController.update)
  app.put('/admin/updateProfilePic', upload.single('image'),[authJwt.verifyToken, adminCheck.isAdmin],adminController.updateProfile)

  app.get('/admin/adminProfile', [authJwt.verifyToken, adminCheck.isAdmin],adminController.adminProfile)
  app.put('/admin/userStatus/:id', [authJwt.verifyToken, adminCheck.isAdmin], adminController.userStatus)


app.put('/changePassword',[authJwt.verifyToken, adminCheck.isAdmin],adminController.changePassword)


}



const authMid = require('../middlewares/Auth/auth.middle');
const authController = require('../controllers/auth.controller')
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
    // app.post('/register',[authMid.fieldCheck,authMid.uniqueEmail] ,authController.signUp);
    app.post('/register' ,authController.signUp);
    // app.post('/login',[authMid.fieldCheck,authMid.userCheckEmail],authController.signIn);
    app.post('/login',authController.signIn);
    app.post('/verifyotp',authController.verifyOtp);
    app.post('/resendotp',authController.resendOTP);
    app.post('/forgotPassword',authController.forgotPassword)
    app.post('/resetPassword',authController.resetPassword)
    app.get('/userProfile',[authJwt.verifyToken],authController.userProfile)
    app.put('/userProfileUpdate', upload.single('image'),[authJwt.verifyToken],authController.userProfileUpdate)

}
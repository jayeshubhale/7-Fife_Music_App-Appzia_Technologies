const ArtistController = require('../controllers/Artist.controller.js');
const adminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');
const multer = require('multer');

var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, 'image-' + uniqueSuffix + '.' + extension);
  }
});

// Create multer instance with disk storage engine
var upload = multer({
  storage: fileStorageEngine
});

module.exports = (app) => {
  app.post('/createartist', upload.single('image'),[authJwt.verifyToken, adminCheck.isAdmin], ArtistController.createArtist);
  app.put('/updateartist/:id', upload.single('image'),[authJwt.verifyToken, adminCheck.isAdmin], ArtistController.updateArtist);
  app.delete('/deleteartist/:id',[authJwt.verifyToken, adminCheck.isAdmin], ArtistController.deleteArtist);
  app.put('/changeartiststatus/:id',[authJwt.verifyToken, adminCheck.isAdmin], ArtistController.changeArtistStatus);
  app.get('/getArtistById/:id',[authJwt.verifyToken, adminCheck.isAdmin],ArtistController.getArtistById)
  app.get('/getAllArtist',[authJwt.verifyToken, adminCheck.isAdmin],ArtistController.getAllArtist)
  app.get('/allArtist',[authJwt.verifyToken, adminCheck.isAdmin],ArtistController.allArtist)

};

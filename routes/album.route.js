const albumController = require('../controllers/album.controller');
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
  app.post('/createalbum', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], albumController.createAlbum);
  app.put('/updatealbum/:id', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], albumController.updateAlbum);
  app.delete('/deletealbum/:id', [authJwt.verifyToken, adminCheck.isAdmin], albumController.deleteAlbum);
  app.put('/changealbumStatus/:id', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], albumController.changeAlbumStatus);
  app.get('/getalbums', [authJwt.verifyToken, adminCheck.isAdmin], albumController.getAlbums);
  app.get('/allAlbums', [authJwt.verifyToken, adminCheck.isAdmin], albumController.allAlbums);

  app.get('/subcategoryId', [authJwt.verifyToken, adminCheck.isAdmin], albumController.getsubcategories);
  app.delete('/deletMany',albumController.deletMany)
  app.get('/getAlbumSubid/:subcategoryId', [authJwt.verifyToken, adminCheck.isAdmin], albumController.getAlbumSubid);



};

// Import necessary modules
const express = require('express');
const router = express.Router();
const karaokeController = require('../controllers/karaoke')
const multer = require('multer');

var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, "[karaokeFile]-" + file.originalname);
  }
});

var upload = multer({
  storage: fileStorageEngine
})
const authJwt = require('../middlewares/authjwt');


module.exports = (app) => {
    app.get('/karaokeSongs', [authJwt.verifyToken], karaokeController.karaokeSongs);
    app.post('/addKaraokeSong',upload.single('karaokeFile'), [authJwt.verifyToken], karaokeController.addKaraokeSong);
}
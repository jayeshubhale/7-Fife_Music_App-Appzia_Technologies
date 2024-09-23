const express = require('express');
const multer = require('multer');
const path = require('path');
const authJwt = require('../middlewares/authjwt');
const adminCheck = require('../middlewares/Admin');
const songController = require('../controllers/song.controller');






const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'coverArtImage' || file.fieldname === 'musicFile' || file.fieldname === 'karaokeFile') {
            cb(null, './uploads');
          }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = (app) => {
    app.use(router);

    router.post('/createsong', [authJwt.verifyToken, adminCheck.isAdmin], upload.fields([{ name: 'coverArtImage', maxCount: 1 }, { name: 'musicFile', maxCount: 1 },{ name: 'karaokeFile', maxCount: 1 }]), songController.createSong);
    router.put('/updatesong/:_id', [authJwt.verifyToken, adminCheck.isAdmin], upload.fields([{ name: 'coverArtImage', maxCount: 1 }, { name: 'musicFile', maxCount: 1 }]), songController.updateSong);
    router.put('/updatesong/:id', [authJwt.verifyToken, adminCheck.isAdmin], upload.fields([{ name: 'coverArtImage', maxCount: 1 }, { name: 'musicFile', maxCount: 1 }]), songController.updateSong);
    router.delete('/deletesong/:id', [authJwt.verifyToken, adminCheck.isAdmin], songController.deleteSong);
    router.get('/getsong/:id', songController.getSong);
    router.put('/changesongstatus/:id', [authJwt.verifyToken, adminCheck.isAdmin], songController.changeSongStatus);
    router.get('/getAllSongs', [authJwt.verifyToken], songController.getAllSongs);
    router.get('/songlyrics', [authJwt.verifyToken], songController.songlyrics);
    router.get('/getTrackFromMusicFile/:_id', [authJwt.verifyToken], songController.getTrackFromMusicFile);

}

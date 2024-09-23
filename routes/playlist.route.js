const playlistController = require('../controllers/playlist.controller');
const authJwt = require('../middlewares/authjwt');
const playlist = require('../middlewares/playlist');


module.exports = (app) => {
    app.post('/createplaylist',[authJwt.verifyToken],playlistController.createPlaylist);
    app.put('/addsongs/:id',[authJwt.verifyToken],playlistController.addSong);
    app.put('/removesongs/:id',[authJwt.verifyToken],playlistController.removeSong);
    app.put('/editPlaylist/:id',[authJwt.verifyToken],playlistController.editPlaylist);
    app.get('/getplaylist/:id',[authJwt.verifyToken],playlistController.getPlaylist);
    app.get('/getAllPlaylist',[authJwt.verifyToken],playlistController.getAllPlaylist);
    app.delete('/deleteplaylist/:id',[authJwt.verifyToken],playlistController.deletePlaylist)
    app.get('/getAllSongsPlaylist',[authJwt.verifyToken],playlistController.getAllSongsPlaylist)
}
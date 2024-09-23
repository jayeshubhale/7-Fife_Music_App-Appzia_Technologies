const userController = require('../controllers/user.controller');
const reqBody = require('../middlewares/reqBody');
const authJwt = require('../middlewares/authjwt');
const isAdminOrUser = require('../middlewares/isAdminOrUser');
const idChecker = require('../middlewares/idchecker');




module.exports = (app) => {

    app.post('/userRegister',userController.userRegister)
    // app.post('/verifyOTP',userController.verifyOTP);
    app.post('/google/registration/login',userController.createGoogle);
    app.post('/facebook/registration/login',userController.createFacebook);
    // app.put('/editProfile',[authJwt.verifyToken],userController.editProfile);
    app.put('/forgetPassword1',[reqBody.userCheckEmail],userController.passUpCreate);
    app.delete('/deleteUser/:id',[idChecker.idCheck,authJwt.verifyToken,isAdminOrUser.AdminOrOwner],userController.deleteUser);
    app.get('/userPlaylist',[authJwt.verifyToken],userController.getUserPlaylist);
    app.post('/favriotesong/:songId',[authJwt.verifyToken],userController.favrioteSong);
    app.get('/mostplayedsong',[authJwt.verifyToken],userController.getmostPlayedSong);
    app.get('/userfavriotesong',[authJwt.verifyToken],userController.getfavrioteSongs);
    app.get('/playsong/:id',[authJwt.verifyToken], userController.PlayedSong);
    app.put('/followingartist/:id',[authJwt.verifyToken],userController.followingArtist);
    app.get('/followedArtistData',[authJwt.verifyToken],userController.followedArtistData);
    app.get('/singleArtistData/:id',[authJwt.verifyToken],userController.singleArtistData);
    app.put('/sing/:id',[authJwt.verifyToken],userController.evaluateAccuracy);
    app.get('/ranking',[authJwt.verifyToken],userController.ranking);
    app.put('/changeuserstatus/:id',[authJwt.verifyToken,idChecker.idCheck],userController.changeUserStatus);
    app.put('/updateName',[authJwt.verifyToken],userController.updateName)
    app.put('/updateEmail',[authJwt.verifyToken],userController.updateEmail)
    app.get('/usergetAllSongs',[authJwt.verifyToken],userController.usergetAllSongs)
    app.get('/newRelease',[authJwt.verifyToken],userController.newRelease)
    app.get('/musicCategories',[authJwt.verifyToken],userController.homeData)
    app.get('/songTypeData',userController.songTypeData)
    app.get('/artistData',userController.artistData)
    app.get('/recommendedSongs',[authJwt.verifyToken],userController.recommendedSongs)
    app.get('/search',[authJwt.verifyToken],userController.search)

    app.get('/deleteUserById/:id',userController.deleteUserById)

}

// Import necessary modules
const express = require('express');
const router = express.Router();
const favoriteSongController = require('../controllers/favoriteSong.controller');
const authJwt = require('../middlewares/authjwt');

module.exports = (app) => {
app.post('/addfavoritesong/:songId', [authJwt.verifyToken], favoriteSongController.addToFavorites);
app.delete('/removeFavorites/:songId',[authJwt.verifyToken],favoriteSongController.removeFavorites);
app.get('/allFavoritesSong',[authJwt.verifyToken],favoriteSongController.allFavoritesSong)
app.post('/addToQueue/:songId', [authJwt.verifyToken], favoriteSongController.addtoQueue);

}
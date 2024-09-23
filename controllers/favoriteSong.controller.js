const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const FavoriteSong = require('../models/favoriteSong');
const Song = require('../models/song.model');

const addToFavorites = async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.userId;

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ error_code: 404, message: 'Song not found' });
        }
        const existingFavorite = await FavoriteSong.findOne({ userId, songId });
        if (existingFavorite) {
            return res.status(400).json({ error_code: 400, message: 'Song is already in favorites' });
        }

        const newFavorite = new FavoriteSong({ userId, songId, isFavorite: true });
        await newFavorite.save();

        return res.status(201).json({
            error_code: 201,
            message: 'Song added to favorites successfully',
            favoriteSong: newFavorite
        });
    } catch (error) {
        console.error('Error adding song to favorites:', error);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
}

const allFavoritesSong = async (req, res) => {
    try {
        const userId = req.userId;

        const favoriteSongs = await FavoriteSong.find({ userId: userId });
        return res.status(200).json({
            error_code: 200,
            message: 'Favorite songs retrieved successfully',
            favoriteSongs: favoriteSongs
        });
    } catch (error) {
        console.error('Error fetching favorite songs:', error);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
}

const removeFavorites = async (req, res) => {
    try {
        const userId = req.userId;
        const { songId } = req.params;


        await FavoriteSong.findOneAndDelete({ userId: userId, songId: songId });

        return res.status(200).json({
            error_code: 200,
            message: 'Song removed from favorites successfully'
        });
    } catch (error) {
        console.error('Error removing song from favorites:', error);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};

const addtoQueue = async (req, res) => {
    try {
        const { songId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                error_code: 404,
                message: 'Song not found'
            });
        }

        const isInQueue = user.queue.includes(songId);

        if (isInQueue) {
            // If the song is already in the queue, remove it
            user.queue.pull(songId);
            await user.save();
            return res.status(200).json({
                error_code: 200,
                message: 'Song removed from queue successfully',
                song: {
                    songId: song._id,
                    songName: song.title,
                    artistName: song.artistName,
                    duration: song.duration
                }
            });
        } else {
            // If the song is not in the queue, add it
            user.queue.push(songId);
            await user.save();
            return res.status(200).json({
                error_code: 200,
                message: 'Song added to queue successfully',
                song: {
                    songId: song._id,
                    songName: song.title,
                    artistName: song.artistName,
                    duration: song.duration
                }
            });
        }
    } catch (err) {
        console.error('Error inside addToQueue:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



module.exports = {
    addToFavorites,
    removeFavorites,
    addtoQueue,
    allFavoritesSong
};

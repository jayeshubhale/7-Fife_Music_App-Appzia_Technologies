
const PlayList = require('../models/playlist.model');
const Song = require('../models/song.model');
const User = require('../models/user.model');
const mongoose = require('mongoose')
const { getBaseUrl } = require("../configs/baseURL");

// const createPlaylist = async (req, res) => {
//     try {
//         if (!req.body.songs) {
//             return res.status(400).send({
//                 error_code: 400,
//                 message: 'Songs must be provided'
//             });
//         }
//         const songIds = Array.isArray(req.body.songs) ? req.body.songs : [req.body.songs];
//         const songs = await Song.find({ _id: { $in: songIds } });
//         if (songs.length !== songIds.length) {
//             return res.status(400).send({
//                 error_code: 400,
//                 message: 'One or more songs do not exist'
//             });
//         }

//         let obj = {
//             name: req.body.name ? req.body.name : undefined,
//             songs: songIds,
//             userId: req.userId
//         };

//         const created_playlist = await PlayList.create(obj);
//         const user = await User.findById(req.userId);
//         await user.playlist.push(created_playlist._id);
//         await user.save();
//         return res.status(201).send({
//             error_code: 200,
//             message: 'Playlist created successfully'
//         });

//     } catch (err) {
//         console.log('Error inside createPlaylist ', err);
//         return res.status(500).send({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };
const createPlaylist = async (req, res) => {
    try {
        let obj = {
            name: req.body.name ? req.body.name : undefined,
            userId: req.userId
        };

        if (req.body.songs && req.body.songs.length > 0) {
            obj.songs = req.body.songs;
        }

        const created_playlist = await PlayList.create(obj);
        const user = await User.findById(req.userId);
        await user.playlist.push(created_playlist._id);
        await user.save();
        return res.status(201).send({
            error_code: 200,
            message: 'Playlist created successfully'
        });

    } catch (err) {
        console.log('Error inside createPlaylist ', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const addSong = async (req, res) => {
    try {
        const playlist = await PlayList.findById(req.params.id);

        if (!playlist) {
            return res.status(404).send({
                error_code: 404,
                message: 'Playlist not found'
            });
        }

        const songsToAdd = Array.isArray(req.body.songs) ? req.body.songs : [req.body.songs];

        const uniqueSongsToAdd = songsToAdd.filter(song => !playlist.songs.includes(song));

        if (uniqueSongsToAdd.length === 0) {
            return res.status(200).send({
                error_code: 200,
                message: ' songs are already in the playlist'
            });
        }

        playlist.songs.push(...uniqueSongsToAdd);
        await playlist.save();

        return res.status(200).send({
            error_code: 200,
            message: 'Songs added to playlist'
        });
    } catch (err) {
        console.log('Error inside update playlist', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal server Error'
        });
    }
};

const editPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const playlist = await PlayList.findById(id);

        if (!playlist) {
            return res.status(404).json({
                error_code: 404,
                message: 'Playlist not found'
            });
        }
        playlist.name = name;

        await playlist.save();

        return res.status(200).json({
            error_code: 200,
            message: 'Playlist name updated successfully',
            playlist: playlist
        });
    } catch (err) {
        console.error('Error editing playlist:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};
const removeSong = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const songToRemove = req.body.song;

        const playlist = await PlayList.findById(playlistId);

        if (!playlist) {
            return res.status(404).send({
                error_code: 404,
                message: 'Playlist not found'
            });
        }

        const updatedPlaylist = await PlayList.findByIdAndUpdate(
            playlistId,
            { $pull: { songs: songToRemove } },
            { new: true }
        );

        return res.status(200).send({
            error_code: 200,
            message: 'Song removed from playlist',
            playlist: updatedPlaylist
        });
    } catch (err) {
        console.log('Error inside removeSong Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const getPlaylist = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req); // Get the base URL

        const playlist = await PlayList.findById(req.params.id)
            .populate({
                path: 'songs',
                select: '_id title coverArtImage musicFile duration artistId',
                populate: { path: 'artistId', select: 'ArtistName' }
            });

        // console.log("🚀 ~ getPlaylist ~ playlist:", playlist);

        if (!playlist) {
            return res.status(404).send({
                error_code: 404,
                message: 'Playlist not found'
            });
        }

        const songs = playlist.songs.map(song => ({
            songId: song._id,
            title: song.title,
            artistNames: song.artistId.map(artist => artist.ArtistName.trim()).join(","),
            coverArtImage: song.coverArtImage ? `${baseUrl}/${song.coverArtImage.imageUrl}` : null, // Add base URL here
            musicFile: song.musicFile ? `${baseUrl}/${song.musicFile.url}` : null, // Add base URL here
            duration: song.duration,
            isFavorite: song.isFavorite
        }));

        return res.status(200).send({
            error_code: 200,
            message: 'Playlist retrieved successfully',
            playlist: {
                _id: playlist._id,
                name: playlist.name,
                songs: songs
            }
        });
    } catch (err) {
        console.error('Error inside getPlaylist Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



// const getAllPlaylist = async (req, res) => {
//     try {
//         const playlists = await PlayList.find({ userId: req.userId });
//         if (!playlists || playlists.length === 0) {
//             return res.status(404).send({
//                 error_code: 404,
//                 message: 'No playlists found for this user'
//             });
//         }

//         return res.status(200).send({
//             error_code: 200,
//             message: 'User playlists retrieved successfully',
//             playlists: playlists
//         });
//     } catch (err) {
//         console.log('Error inside getAllPlaylist Controller', err);
//         return res.status(500).send({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const getAllPlaylist = async (req, res) => {
    try {
        const { search, sort } = req.query;

        const query = { userId: req.userId };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const sortCriteria = {};
        if (sort) {
            const [key, order] = sort.split(':');
            sortCriteria[key] = order === '2' ? -1 : 1;
        }

        console.log("Sort Criteria:", sortCriteria); // Log the sort criteria

        const playlists = await PlayList.find(query)
            .populate({
                path: 'songs',
                select: 'coverArtImage imageUrl',
            })
            .sort(sortCriteria);

        console.log("Playlists after sorting:", playlists); // Log the playlists

        if (!playlists || playlists.length === 0) {
            return res.status(404).send({
                error_code: 404,
                message: 'No playlists found for this user'
            });
        }

        // Get base URL
        const baseUrl = getBaseUrl(req);

        const obj = playlists.map(playlist => ({
            _id: playlist._id,
            name: playlist.name,
            songImage: playlist.songs.length > 0 && playlist.songs[0].coverArtImage
                ? `${baseUrl}/${playlist.songs[0].coverArtImage.imageUrl}` // Add base URL here
                : null
        }));

        return res.status(200).send({
            error_code: 200,
            message: 'User playlists retrieved successfully',
            data: obj
        });
    } catch (err) {
        console.log('Error inside getAllPlaylist Controller', err);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



const deletePlaylist = async (req, res, next) => {
    try {
        const playlistId = req.params.id;

        await PlayList.deleteOne({ _id: playlistId });

        await User.findByIdAndUpdate(req.userId, {
            $pull: { playlist: playlistId }
        });

        return res.status(200).send({
            error_code: 200,
            message: 'Playlist got deleted'
        });
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

const getAllSongsPlaylist = async (req, res) => {
    try {
        const baseUrl = getBaseUrl(req); // Get the base URL
        const songs = await Song.find().populate('artistId');
        console.log("🚀 ~ karaokeSongs ~ songs:", songs);

        const obj = songs.map(song => ({
            songId: song._id,
            title: song.title,
            artistNames: song.artistId.map(artist => artist.ArtistName).join(','),
            coverArtImage: `${baseUrl}/${song.coverArtImage.imageUrl}`, // Add baseUrl
            duration: song.duration,
        }));

        return res.status(200).json({
            error_code: 200,
            message: 'Songs retrieved successfully',
            data: obj
        });
    } catch (err) {
        console.error('Error fetching songs:', err);
        return res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
}


module.exports = {
    createPlaylist,
    addSong,
    editPlaylist,
    removeSong,
    getPlaylist,
    getAllPlaylist,
    deletePlaylist,
    getAllSongsPlaylist
}
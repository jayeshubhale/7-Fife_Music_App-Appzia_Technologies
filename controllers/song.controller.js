const Song = require("../models/song.model");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static").path;
ffmpeg.setFfmpegPath(ffmpegPath);
const spleeter = require("spleeter");
const { spawn } = require("child_process");
const Category = require("../models/categories.model");
const Subcategory = require("../models/subcategories.model");
const Album = require("../models/album.model");
const Artist = require("../models/artist.model");
const Language = require("../models/language.model");
const fs = require("fs");

const { getBaseUrl } = require("../configs/baseURL");

// const baseUrl = getBaseUrl(req);
// const fullImageUrl = `${baseUrl}/${artist.imageUrl.replace(/\\/g, '/')}`;

const mm = require("music-metadata");

// -----------------------------------------------

const createSong = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      albumId,
      artistId,
      title,
      languageId,
      type,
      musicLink,
      trackerID,
      lyrics,
      songType,
    } = req.body;

    if (!type || !["1", "2"].includes(type)) {
      return res.status(400).json({
        error_code: 400,
        message: "Invalid or missing type parameter",
      });
    }

    let musicFilePath;
    let musicFileUrl;
    let songDuration; // Variable to store the duration of the song

    if (type === "1") {
      if (!musicLink || !trackerID) {
        return res.status(400).json({
          error_code: 400,
          message: "Music link and tracker ID are required for type 1",
        });
      }
    } else if (type === "2") {
      if (!req.files || !req.files.musicFile) {
        return res.status(400).json({
          error_code: 400,
          message: "Music file is required",
        });
      }

      if (
        !Array.isArray(req.files.musicFile) ||
        req.files.musicFile.length === 0
      ) {
        return res.status(400).json({
          error_code: 400,
          message: "Invalid music file provided",
        });
      }
      musicFilePath = req.files.musicFile[0].path;
      musicFileUrl = `${musicFilePath}`;

      const metadata = await mm.parseFile(musicFilePath);
      // console.log("🚀 ~ createSong ~ metadata:", metadata)
      songDuration = metadata.format.duration;
    }

    // console.log("🚀 ~ createSong ~ musicFilePath:", musicFilePath);
    const { coverArtImage, karaokeFile } = req.files;

    const coverArtImagePath = coverArtImage[0].path;
    const coverArtImageUrl = `${coverArtImagePath}`;

    const karaokeFilePath = karaokeFile[0].path;
    const karaokeFileUrl = `${karaokeFilePath}`;

    const [category, subcategory, album, language] = await Promise.all([
      Category.findById(categoryId),
      Subcategory.findById(subcategoryId),
      Album.findById(albumId),
      Language.findById(languageId),
    ]);

    if (![category, subcategory, album, language].every((entity) => entity)) {
      const missingEntities = [
        "Category",
        "Subcategory",
        "Album",
        "Language",
      ].filter(
        (entity, index) => ![category, subcategory, album, language][index]
      );
      const errorMessage = `The following entities were not found: ${missingEntities.join(
        ","
      )}.`;
      return res.status(402).json({
        error_code: 402,
        message: errorMessage,
      });
    }

    const artistIdsArray = artistId.split(",").map((id) => id.trim());

    let newSong;

    if (type === "1") {
      newSong = await Song.create({
        categoryId,
        subcategoryId,
        albumId,
        artistId: artistIdsArray,
        title,
        languageId,
        musicLink,
        trackerID,
        songType,
        karaokeFile: {
          filename: karaokeFile[0].filename,
          fileAddress: karaokeFilePath,
          karaokeUrl: karaokeFileUrl,
        },
        coverArtImage: {
          filename: coverArtImage[0].filename,
          fileAddress: coverArtImagePath,
          imageUrl: coverArtImageUrl,
        },
      });
    } else if (type === "2") {
      newSong = await Song.create({
        categoryId,
        subcategoryId,
        albumId,
        artistId: artistIdsArray,
        title,
        languageId,
        lyrics,
        songType,
        duration: songDuration,
        coverArtImage: {
          filename: coverArtImage[0].filename,
          fileAddress: coverArtImagePath,
          imageUrl: coverArtImageUrl,
        },
        musicFile: {
          filename: req.files.musicFile[0].filename,
          fileAddress: musicFilePath,
          url: musicFileUrl,
        },
        karaokeFile: {
          filename: karaokeFile[0].filename,
          fileAddress: karaokeFilePath,
          karaokeUrl: karaokeFileUrl,
        },
      });
    }
    // console.log("🚀 ~ createSong ~ newSong:", newSong);

    return res.status(200).json({
      error_code: 200,
      message: "Song created successfully",
      song: newSong,
    });
  } catch (err) {
    console.error("Error inside createSong:", err);
    return res.status(500).json({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

const updateSong = async (req, res) => {
  try {
    const { _id } = req.params;
    // console.log("🚀 ~ updateSong ~ songId:", songId)
    const song = await Song.findById(_id);
    // console.log("🚀 ~ updateSong ~ song:", song)

    if (!song) {
      return res
        .status(404)
        .json({ error_code: 404, message: "Song not found" });
    }

    const {
      categoryId,
      subcategoryId,
      albumId,
      artistId,
      title,
      languageId,
      type,
      musicLink,
      trackerID,
      lyrics,
      songType,
    } = req.body;

    const updates = {};

    // Input validation
    if (categoryId) updates.categoryId = categoryId;
    if (subcategoryId) updates.subcategoryId = subcategoryId;
    if (albumId) updates.albumId = albumId;
    if (artistId) {
      updates.artistId = artistId.split(",").map((id) => id.trim());
    }
    if (title) updates.title = title;
    if (languageId) updates.languageId = languageId;
    if (type) {
      if (!["1", "2"].includes(type)) {
        return res
          .status(400)
          .json({ error_code: 400, message: "Invalid type parameter" });
      }
      updates.type = type;
      if (type === "1") {
        if (!musicLink || !trackerID) {
          return res
            .status(400)
            .json({
              error_code: 400,
              message: "Music link and tracker ID are required for type 1",
            });
        }
        updates.musicLink = musicLink;
        updates.trackerID = trackerID;
      } else if (type === "2") {
        // if (!req.files || !req.files.musicFile) {
        //   return res.status(400).json({ error_code: 400, message: 'Music file is required' });
        // }
        if (req.files && req.files.musicFile) {
          const musicFilePath = req.files.musicFile[0].path;
          const musicFileUrl = `${musicFilePath}`;
          updates.musicFile = {
            filename: req.files.musicFile[0].filename,
            fileAddress: musicFilePath,
            url: musicFileUrl,
          };
          const metadata = await mm.parseFile(musicFilePath);
          updates.duration = Math.round(metadata.format.duration);
        }
      }
    }
    if (lyrics !== undefined) updates.lyrics = lyrics;

    // Update cover art image if provided
    if (req.files && req.files.coverArtImage) {
      const coverArtImage = req.files.coverArtImage[0];
      const coverArtImagePath = coverArtImage.path;
      const coverArtImageUrl = `${coverArtImagePath}`;
      updates.coverArtImage = {
        filename: coverArtImage.filename,
        fileAddress: coverArtImagePath,
        imageUrl: coverArtImageUrl,
      };
      updates.songType = songType;
    }

    // Perform the update and return the updated song
    const updatedSong = await Song.findByIdAndUpdate(_id, updates, {
      new: true,
    });

    if (!updatedSong) {
      return res
        .status(404)
        .json({ error_code: 404, message: "Song not found" });
    }

    return res.status(200).json({
      error_code: 200,
      message: "Song updated successfully",
      song: updatedSong,
    });
  } catch (err) {
    console.error("Error inside updateSong:", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal Server Error" });
  }
};


const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSong = await Song.findByIdAndDelete(id);
    if (!deletedSong) {
      return res
        .status(404)
        .json({ error_code: 404, message: "Song not found" });
    }
    return res
      .status(200)
      .json({ error_code: 200, message: "Song deleted successfully" });
  } catch (err) {
    console.error("Error inside deleteSong:", err);
    return res
      .status(500)
      .json({ error_code: 500, message: "Internal Server Error" });
  }
};


// --------------------------------------------------------------



const getSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id)
      .populate("languageId", "name")
      .populate("artistId", "ArtistName")
      .select("title musicLink trackerID lyrics coverArtImage musicFile");

    if (!song) {
      return res.status(404).json({ error_code: 404, message: "Song not found" });
    }

    const baseUrl = getBaseUrl(req);

    const {
      languageId,
      artistId,
      musicLink,
      trackerID,
      lyrics,
      coverArtImage,
      musicFile,
    } = song;

    const languageName = languageId ? languageId.name : "Language not available";
    const artistNames = artistId.map((artist) => artist.ArtistName);

    const imageUrl = coverArtImage
      ? `${baseUrl}/${coverArtImage.imageUrl.replace(/\\/g, '/')}`
      : "Image not available";

    const url = musicFile
      ? `${baseUrl}/${musicFile.url.replace(/\\/g, '/')}`
      : "Music file not available";

    const songData = {
      languageName: languageName,
      artistNames: artistNames,
      musicLink: musicLink || "Music link not available",
      trackerID: trackerID || "Tracker ID not available",
      lyrics: lyrics || "Lyrics not available",
      imageUrl: imageUrl,
      url: url,
    };

    return res.status(200).json({
      error_code: 200,
      message: "Song retrieved successfully",
      song: songData,
    });
  } catch (err) {
    console.error("Error inside getSong:", err);
    return res.status(500).json({ error_code: 500, message: "Internal Server Error" });
  }
};


// const getSong = async (req, res) => {
//   try {

//     const { id } = req.params;
//     const song = await Song.findById(id)
//     .populate("languageId", "name")
//     .populate("artistId", "ArtistName")
//     .select("title musicLink trackerID lyrics coverArtImage musicFile");

//     if (!song) {
//       return res
//       .status(404)
//       .json({ error_code: 404, message: "Song not found" });
//     }

//     const baseUrl = getBaseUrl(req);
//     const fullImageUrl = `${baseUrl}/${Song.imageUrl.replace(/\\/g, '/')}`;


//     const {
//       languageId,
//       artistId,
//       musicLink,
//       trackerID,
//       lyrics,
//       coverArtImage,
//       musicFile,
//     } = song;
//     const languageName = languageId
//       ? languageId.name
//       : "Language not available";
//     const artistNames = artistId.map((artist) => artist.ArtistName);
//     const imageUrl = coverArtImage
//       ? coverArtImage.imageUrl
//       : "Image not available";
//     const url = musicFile ? musicFile.url : "Music file not available";

//     const songData = {
//       languageName: languageName,
//       artistNames: artistNames,
//       musicLink: musicLink || "Music link not available",
//       trackerID: trackerID || "Tracker ID not available",
//       lyrics: lyrics || "Lyrics not available",
//       imageUrl: imageUrl,
//       url: url,
//     };

//     return res.status(200).json({
//       error_code: 200,
//       message: "Song retrieved successfully",
//       song: songData,
//     });
//   } catch (err) {
//     console.error("Error inside getSong:", err);
//     return res
//       .status(500)
//       .json({ error_code: 500, message: "Internal Server Error" });
//   }
// };
// const getBaseUrl = (req) => {
//   const baseUrl = `${req.protocol}://${req.get('host')}/`;
//   return baseUrl;
// };

// const getSong = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const song = await Song.findById(id)
//       .populate('languageId', 'name')
//       .populate('artistId', 'ArtistName')
//       .select('title musicLink trackerID lyrics coverArtImage musicFile');

//     if (!song) {
//       return res.status(404).json({ error_code: 404, message: 'Song not found' });
//     }

//     const { languageId, artistId, musicLink, trackerID, lyrics, coverArtImage, musicFile } = song;
//     const languageName = languageId ? languageId.name : 'Language not available';
//     const artistNames = artistId.map(artist => artist.ArtistName);
//     const imageUrl = coverArtImage ? getBaseUrl(req) + coverArtImage.fileAddress : 'Image not available';
//     const url = musicFile ? getBaseUrl(req) + musicFile.fileAddress : 'Music file not available';

//     const songData = {
//       languageName: languageName,
//       artistNames: artistNames,
//       musicLink: musicLink || 'Music link not available',
//       trackerID: trackerID || 'Tracker ID not available',
//       lyrics: lyrics || 'Lyrics not available',
//       imageUrl: imageUrl,
//       url: url
//     };

//     return res.status(200).json({
//       error_code: 200,
//       message: 'Song retrieved successfully',
//       song: songData
//     });
//   } catch (err) {
//     console.error('Error inside getSong:', err);
//     return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
//   }
// };

const changeSongStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const songData = await Song.findById(id);
    if (!songData) {
      return res.status(400).send({
        error_code: 400,
        message: "song not found",
      });
    }

    songData.status =
      songData.status === "activate" ? "deactivate" : "activate";

    await songData.save();
    res.status(200).send({
      message: `song status toggled successfully to ${songData.status}`,
      songData: songData,
    });
  } catch (err) {
    console.error("Error inside update admin", err);
    res.status(500).send({
      error_code: 500,
      message: "Internal Server Error",
    });
  }
};

// --------------------------------------------------------------

const getAllSongs = async (req, res) => {
  try {
    const { title, artist, category, page, limit } = req.query;

    // Build match stage for filtering based on search fields
    const matchStage = {};
    ["title", "artist", "category"].forEach((field) => {
      if (req.query[field]) {
        matchStage[field] = { $regex: req.query[field], $options: "i" };
      }
    });

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.max(1, parseInt(limit) || 5);

    const baseUrl = getBaseUrl(req);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "albums",
          localField: "albumId",
          foreignField: "_id",
          as: "album",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategoryId",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      {
        $lookup: {
          from: "artists",
          localField: "artistId",
          foreignField: "_id",
          as: "artist",
        },
      },
      {
        $project: {
          title: 1,
          category: { $arrayElemAt: ["$category.name", 0] },
          subcategory: { $arrayElemAt: ["$subcategory.SubCategoriesName", 0] },
          artist: { $arrayElemAt: ["$artist.ArtistName", 0] },
          album: { $arrayElemAt: ["$album.albumName", 0] },
          imageUrl: {
            $cond: {
              if: { $ne: ["$coverArtImage.imageUrl", null] },
              then: { $concat: [baseUrl, "/", { $replaceAll: { input: "$coverArtImage.imageUrl", find: "\\", replacement: "/" } }] },
              else: "Image not available"
            }
          },
          url: {
            $cond: {
              if: { $ne: ["$musicFile.url", null] },
              then: { $concat: [baseUrl, "/", { $replaceAll: { input: "$musicFile.url", find: "\\", replacement: "/" } }] },
              else: "Music file not available"
            }
          },
          status: "$status",
        },
      },
      { $sort: { title: 1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
    ];

    const totalCount = await Song.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCount / pageSize);

    const songs = await Song.aggregate(pipeline);
    return res.status(200).json({
      error_code: 200,
      message: "Songs retrieved successfully",
      songs,
      total_count: totalCount,
      total_pages: totalPages,
      current_page: pageNumber,
    });
  } catch (err) {
    console.error("Error inside getAllSongs:", err);
    return res.status(500).json({ error_code: 500, message: "Internal server error" });
  }
};


// const getAllSongs = async (req, res) => {
//   try {
//     const { title, artist, category, page, limit } = req.query;

//     // Build match stage for filtering based on search fields
//     const matchStage = {};
//     ["title", "artist", "category"].forEach((field) => {
//       if (req.query[field]) {
//         matchStage[field] = { $regex: req.query[field], $options: "i" };
//       }
//     });

//     const pageNumber = Math.max(1, parseInt(page) || 1);
//     const pageSize = Math.max(1, parseInt(limit) || 5);

//     const baseUrl = getBaseUrl(req);

//     const pipeline = [
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "categoryId",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $lookup: {
//           from: "albums",
//           localField: "albumId",
//           foreignField: "_id",
//           as: "album",
//         },
//       },
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "subcategoryId",
//           foreignField: "_id",
//           as: "subcategory",
//         },
//       },
//       {
//         $lookup: {
//           from: "artists",
//           localField: "artistId",
//           foreignField: "_id",
//           as: "artist",
//         },
//       },
//       {
//         $project: {
//           title: 1,
//           category: { $arrayElemAt: ["$category.name", 0] },
//           subcategory: { $arrayElemAt: ["$subcategory.SubCategoriesName", 0] },
//           artist: { $arrayElemAt: ["$artist.ArtistName", 0] },
//           album: { $arrayElemAt: ["$album.albumName", 0] },
//           imageUrl: {
//             $cond: {
//               if: { $ne: ["$coverArtImage.imageUrl", null] },
//               then: { $concat: [baseUrl, "/", { $replaceAll: { input: "$coverArtImage.imageUrl", find: "\\", replacement: "/" } }] },
//               else: "Image not available"
//             }
//           },
//           url: {
//             $cond: {
//               if: { $ne: ["$musicFile.url", null] },
//               then: { $concat: [baseUrl, "/", { $replaceAll: { input: "$musicFile.url", find: "\\", replacement: "/" } }] },
//               else: "Music file not available"
//             }
//           },
//           status: "$status",
//         },
//       },
//       { $sort: { title: 1 } },
//       { $skip: (pageNumber - 1) * pageSize },
//       { $limit: pageSize },
//     ];

//     const totalCount = await Song.countDocuments(matchStage);
//     const totalPages = Math.ceil(totalCount / pageSize);

//     const songs = await Song.aggregate(pipeline);
//     return res.status(200).json({
//       error_code: 200,
//       message: "Songs retrieved successfully",
//       songs,
//       total_count: totalCount,
//       total_pages: totalPages,
//       current_page: pageNumber,
//     });
//   } catch (err) {
//     console.error("Error inside getAllSongs:", err);
//     return res.status(500).json({ error_code: 500, message: "Internal server error" });
//   }
// };

// const getAllSongs = async (req, res) => {
//   try {
//     const { title, artist, category, page, limit } = req.query;

//     // Build match stage for filtering based on search fields
//     const matchStage = {};
//     ["title", "artist", "category"].forEach((field) => {
//       if (req.query[field]) {
//         matchStage[field] = { $regex: req.query[field], $options: "i" };
//       }
//     });

//     const pageNumber = Math.max(1, parseInt(page) || 1);
//     const pageSize = Math.max(1, parseInt(limit) || 5);

//     const pipeline = [
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "categoryId",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $lookup: {
//           from: "albums",
//           localField: "albumId",
//           foreignField: "_id",
//           as: "album",
//         },
//       },
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "subcategoryId",
//           foreignField: "_id",
//           as: "subcategory",
//         },
//       },
//       {
//         $lookup: {
//           from: "artists",
//           localField: "artistId",
//           foreignField: "_id",
//           as: "artist",
//         },
//       },
//       {
//         $project: {
//           title: 1,
//           category: { $arrayElemAt: ["$category.name", 0] },
//           subcategory: { $arrayElemAt: ["$subcategory.SubCategoriesName", 0] },
//           artist: { $arrayElemAt: ["$artist.ArtistName", 0] },
//           album: { $arrayElemAt: ["$album.albumName", 0] },
//           status: "$status",
//         },
//       },
//       { $sort: { title: 1 } },
//       { $skip: (pageNumber - 1) * pageSize },
//       { $limit: pageSize },
//     ];

//     const totalCount = await Song.countDocuments(matchStage);
//     const totalPages = Math.ceil(totalCount / pageSize);

//     const songs = await Song.aggregate(pipeline);
//     return res.status(200).json({
//       error_code: 200,
//       message: "Songs retrieved successfully",
//       songs,
//       // page:pageNumber,
//       // limit:pageSize,
//       total_count: totalCount,
//       total_pages: totalPages,
//       current_page: pageNumber,
//     });
//   } catch (err) {
//     console.error("Error inside getAllSongs:", err);
//     return res
//       .status(500)
//       .json({ error_code: 500, message: "Internal server error" });
//   }
// };


// ----------------------------------------------------


async function getSongLyrics(artist, title) {
  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${artist}/${title}`
    );
    return response.data.lyrics;
  } catch (error) {
    if (error.response && error.response.data.error === "No lyrics found") {
      return "No lyrics found for the given artist and title.";
    } else {
      console.error(
        "Error fetching song lyrics:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to fetch song lyrics");
    }
  }
}

const songlyrics = async (req, res) => {
  const { artist, title } = req.query;
  console.log(req.query, "hiiiiiiiiiiii");
  if (!artist || !title) {
    return res.status(400).json({
      error_code: 400,
      message: "Missing artist or title query parameter",
    });
  }

  try {
    const lyrics = await getSongLyrics(artist, title);
    res.json({
      artist,
      title,
      lyrics,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error_code: 500,
      message: "Failed to fetch song lyrics",
    });
  }
};

const separateBackgroundMusic = async (audioFilePath) => {
  try {
    console.log("Separating background music...");

    return new Promise((resolve, reject) => {
      // Execute spleeter separation command
      const spleeterProcess = spawn("spleeter", [
        "separate",
        "-i",
        audioFilePath,
        "-o",
        "output_folder", // Output directory
        "-p",
        "spleeter:2stems", // Separation configuration (2stems = vocals and accompaniment)
      ]);

      // Listen for process events
      spleeterProcess.on("error", (err) => {
        console.error("Spleeter process error:", err);
        reject(err);
      });

      spleeterProcess.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Spleeter process exited with code ${code}`);
          reject(new Error("Spleeter process exited with non-zero code"));
        } else {
          // Process completed successfully
          console.log("Spleeter process completed successfully");
          resolve("output_folder/background.wav");
        }
      });

      spleeterProcess.on("close", (code) => {
        console.log("Spleeter process closed");
      });
    });
  } catch (error) {
    console.error("Error separating background music:", error);
    throw error;
  }
};

const getTrackFromMusicFile = async (req, res) => {
  try {
    const _id = req.params._id;

    // Find the song by ID
    const music = await Song.findById(_id);
    if (!music) {
      return res.status(404).send("Music not found");
    }

    const musicFilePath = music.musicFile.fileAddress;

    // Separate background music
    const backgroundMusicFilePath = await separateBackgroundMusic(
      musicFilePath
    );

    // Set response headers for audio
    res.set("Content-Type", "audio/wav");

    // Create read stream for background music file
    const stream = fs.createReadStream(backgroundMusicFilePath);

    // Pipe the stream to the response
    stream.on("error", (err) => {
      console.error("Error reading background music file:", err);
      res.status(500).send("Internal Server Error");
    });
    stream.pipe(res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createSong,
  updateSong,
  deleteSong,
  getSong,
  getAllSongs,
  changeSongStatus,
  songlyrics,
  getTrackFromMusicFile,
};

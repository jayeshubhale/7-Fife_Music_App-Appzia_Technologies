const ImportSong = require('../models/importsong.model');

const importSong = async (req, res) => {
  try {
    // Extract fields from request body
    const {
      category,
      subcategory,
      album,
      artist,
      title,
      musicLink,
      trackerID,
      lyrics,
      language
    } = req.body;

    // Check if files were uploaded
    if (!req.files || !req.files.coverArtImage || !req.files.musicFile) {
      console.error('Error: Both image and music file are required.');
      return res.status(400).json({ error_code: 400, message: 'Both image and music file are required.' });
    }

    // Retrieve file paths
    const coverArtImagePath = req.files.coverArtImage[0].path;
    const musicFilePath = req.files.musicFile[0].path;

    // Create a new importSong object
    const newImportSong = await ImportSong.create({
      category,
      subcategory,
      album,
      artist,
      title,
      musicLink,
      trackerID,
      lyrics,
      language,
      coverArtImage: {
        filename: req.files.coverArtImage[0].filename,
        fileAddress: coverArtImagePath
      },
      musicFile: {
        filename: req.files.musicFile[0].filename,
        fileAddress: musicFilePath
      }
    });

    // Respond with success message
    return res.status(201).json({
      error_code: 200,
      message: 'Import Song successfully',
      importSong: newImportSong
    });
  } catch (err) {
    console.error('Error inside importSong:', err);
    return res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
  }
};

module.exports = { importSong };

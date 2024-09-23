const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const importSongSchema = new Schema({
  category: String,
  subcategory: String,
  album: String,
  artist: String,
  title: String,
  musicLink: String,
  trackerID: String,
  lyrics: String,
  language: String,
  coverArtImage: {
    filename: String,
    fileAddress: String
  },
  musicFile: {
    filename: String,
    fileAddress: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ImportSong', importSongSchema);

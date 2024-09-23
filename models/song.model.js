// song.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "SubCategories" },
    albumId: { type: Schema.Types.ObjectId, ref: "Album" },
    artistId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
    title: String,
    musicLink: String,
    trackerID: String,
    separateTrack: Boolean,
    lyrics: {
      type: String,
    },
    languageId: { type: Schema.Types.ObjectId, ref: "Language" },
    coverArtImage: {
      filename: String,
      fileAddress: String,
      imageUrl: String,
    },
    karaokeFile: {
      filename: String,
      fileAddress: String,
      karaokeUrl: String,
    },
    musicFile: {
      filename: String,
      fileAddress: String,
      url: String,
    },
    songType: { type: String },
    duration: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["activate", "deactivate"],
      default: "activate",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);

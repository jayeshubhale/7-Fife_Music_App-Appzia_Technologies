const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const albumSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategories",
      required: true,
    },
    albumName: { type: String, required: true },
    shortDescription: { type: String, required: true },
    image: {
      fileName: { type: String },
      fileAddress: { type: String },
    },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["activate", "deactivate"],
      default: "activate",
    },
  },
  { timestamps: true }
); // This will add createdAt and updatedAt fields

// Create the model
const Album = mongoose.model("Album", albumSchema);

module.exports = Album;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const constant = require("../util/constant");
var Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    default: function () {
      return "guest" + Math.floor(Math.random() * 10000);
    },
  },
  image: {
    fileName: String,
    fileAddress: String,
  },
  deviceToken: { type: String, default: "" },
  accessToken: { type: String, default: "" },
  deviceType: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  firstName: String,
  lastName: String,
  address: String,
  mobileNo: Number,
  email: {
    type: String,
    // required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true
  },
  userTypes: {
    type: String,
    enum: [constant.userTypes.admin, constant.userTypes.customer],
    default: constant.userTypes.customer,
  },
  status: {
    type: String,
    enum: ["Active", "Deactive"],
    default: "Active",
  },
  registerWith: {
    type: String,
    enum: [
      constant.registerWith.Email,
      constant.registerWith.google,
      constant.registerWith.facebook,
    ],
    default: constant.registerWith.Email,
  },
  playlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayList",
    },
  ],
  favoriteSongs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  mostPlayedSongs: {
    type: Object,
    default: {},
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
    },
  ],
  queue: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  otp: Number,
  otpVerifly: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("deleteOne", async function (next) {
  const userId = this.getFilter()["_id"];
  const Artist = require("../models/artist.model");
  const artist = await Artist.find({ followers: userId });

  const artistPromises = artist.map(async (artist) => {
    artist.followers.pull(userId);
    await artist.save();
  });

  await Promise.all(artistPromises);
});


module.exports = mongoose.model("User", userSchema);

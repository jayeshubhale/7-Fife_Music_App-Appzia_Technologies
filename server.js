const express = require("express");
const mongoose = require("mongoose");
const serverConfig = require("./configs/server.config");
const dbConfig = require("./configs/db.config");
const multer = require("multer");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const constant = require("./util/constant");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const dotenv = require("dotenv");

const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

const URL = "mongodb+srv://app:app@cluster0.mntoeil.mongodb.net/7fife";
// const corsOptions = {
//   origin: "*",
// };

dotenv.config();
//  app.options("*", cors());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

app.use((req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  req.baseUrl = baseUrl;
  next();
});

const connectDb = async () => {
  return new Promise((resolve, reject) => {
    await = mongoose
      .connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("MongoDB connection established");
        resolve();
      })
      .catch((err) => {
        console.error(`Error in MongoDB connection: ${err.message}`);
        reject(err);
      });
  });
};

const findDefaultAdmin = async () => {
  try {
    const obj = {
      userTypes: constant.userTypes.admin,
      firstName: "Jayesh",
      lastName: "Ubhale",
      mobileNumber: "9112603100",
      userName: "admin_7fife",
      email: "admin7fife@gmail.com",
      password: "Admin@123",
      address: "INDIA",
      otpVerifly: true,
    };
    const admin = await User.create(obj);
    console.log("Default Admin Created", admin);
  } catch (error) {
    console.error("Error finding or creating default admin:", error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },
});

const upload = multer({ storage: storage });
// app.use(upload.any());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((error, req, res, next) => {
  const message = `this is the Unexpected field --> ${error.field}`;
  return res.status(500).send(message);
});

app.post("/upload", upload.single("image"), (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  const imageUrl = req.file ? req.file.path : null;
  res.json({ name, password, imageUrl });
});

app.post("/jsondata", (req, res) => {
  const jsonData = req.body;
  res.json(jsonData);
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((error, req, res, next) => {
  let message = "Unexpected error";
  if (error && error.field) {
    message = `Unexpected field: ${error.field}`;
  } else if (error && error.message) {
    message = error.message;
  }
  console.error(message);
  return res.status(500).send(message);
});

require("./routes/auth.route")(app);
require("./routes/user.route")(app);
require("./routes/admin.route")(app);
require("./routes/subscription.route")(app);
require("./routes/ads.route")(app);
require("./routes/adsSetting.route")(app);
require("./routes/review.route")(app);
require("./routes/payment.route")(app);
require("./routes/form.route")(app);
require("./routes/notification.route")(app);
require("./routes/privacy.route")(app);
require("./routes/TermsandCondition.route")(app);
require("./routes/song.route")(app);
require("./routes/artist.route")(app);
require("./routes/album.route")(app);
require("./routes/playlist.route")(app);
require("./routes/reward.route")(app);
require("./routes/language.route")(app);
require("./routes/categories.route")(app);
require("./routes/subcategories.route")(app);
require("./routes/importsong.route")(app);
require("./routes/favoriteSong.route")(app);
require("./routes/karaoke")(app);

const start = async () => {
  try {
    connectDb();
    app.listen(serverConfig.PORT, "192.168.0.175", () => {
      console.log(`Application started on port number: ${serverConfig.PORT}`);
    });

    const admins = await User.find({});
    if (admins.length === 0) {
      await findDefaultAdmin();
    } else {
      console.log("Default Admin");
    }
  } catch (error) {
    console.log(error);
  }
};

start();

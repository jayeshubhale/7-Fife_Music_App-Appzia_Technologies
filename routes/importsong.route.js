const importSongController = require('../controllers/importsong.controller');
const multer = require('multer');

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'coverArtImage') {
            cb(null, './uploads');
        } else if (file.fieldname === 'musicFile') {
            cb(null, './uploads');
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = (app) => {
    // Use upload.fields() middleware to handle multiple file uploads with specific field names
    app.post('/importsong', upload.fields([{ name: 'coverArtImage', maxCount: 1 }, { name: 'musicFile', maxCount: 1 }]), importSongController.importSong);
};

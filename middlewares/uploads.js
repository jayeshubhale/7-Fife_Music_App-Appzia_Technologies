const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'coverArtImage' || file.fieldname === 'musicFile') {
            cb(null, './uploads');
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload.any(); // Use upload.any() method

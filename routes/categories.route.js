const categoriesController = require('../controllers/categories.controller'); // Corrected filename
const adminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');

const multer = require('multer');
const maxSize = 5 * 1024 * 1024;

var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, "[image]-" + file.originalname);
    console.log(file.originalname,"hiii");
  }
});

var upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: maxSize }
});

module.exports = (app) => {
  app.post('/createcategories', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.createCategories);
  app.put('/updatecategories/:id', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.updateCategories);
  app.delete('/deletecategories/:id', [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.deleteCategories);
  app.put('/changecategorystatus/:id', [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.changeCategoryStatus);
  app.get('/getcategories', [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.getCategories);
  app.get('/getcategoriesPage', [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.getcategoriesPage);
  app.get('/getCategoryById/:id', [authJwt.verifyToken, adminCheck.isAdmin], categoriesController.getCategoryById);

};

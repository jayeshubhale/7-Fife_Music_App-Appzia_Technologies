const SubCategoriesController = require('../controllers/subcategories.controller');
const adminCheck = require('../middlewares/Admin');
const authJwt = require('../middlewares/authjwt');
const multer = require('multer');

var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, "[image]-" + file.originalname);
  }
});

var upload = multer({
  storage: fileStorageEngine
})

module.exports = (app) => {

  app.post('/createsubCategories', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.createsubCategories);
  app.put('/updateSubCategories/', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.updateSubCategories);
  app.delete('/deleteSubCategories/:id', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.deleteSubCategories);
  app.put('/changeSubCategoryStatus/:id', upload.single('image'), [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.changeSubCategoryStatus);
  app.get('/getCategories/:CategoriesId', [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.getCategories);
  app.delete('/deleteMany', SubCategoriesController.deleteMany);
  app.get('/getSubCategories', [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.getSubCategoriessss);
  app.get('//:id', [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.getSubCategoriesByIdddd);
  app.get('/getAllSubCategoriesOnly', [authJwt.verifyToken, adminCheck.isAdmin], SubCategoriesController.getAllSubCategoriesOnly);

};

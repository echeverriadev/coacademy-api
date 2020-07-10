const express = require('express');
const CategoriesController = require('../controllers/CategoriesController');
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication');
const app = express();


app.get('', CategoriesController.index);
app.get('/actives', CategoriesController.indexActives);
app.get('/:id', [verifyToken, verifyAdminRole, CategoriesController.categoryExistsById], CategoriesController.show);
app.post('', [verifyToken, verifyAdminRole, CategoriesController.categoryExistsByName], CategoriesController.create);
app.put('/:id', [verifyToken, verifyAdminRole, CategoriesController.categoryExistsById], CategoriesController.update);
app.delete('/:id', [verifyToken, verifyAdminRole, CategoriesController.prepareToDelete, CategoriesController.categoryExistsById], CategoriesController.desactivate);
app.post('/:id/reactivate', [verifyToken, verifyAdminRole, CategoriesController.prepareToReactivate, CategoriesController.categoryExistsById], CategoriesController.reactivate)

module.exports = app;
const express = require('express');
const UsersController = require('../controllers/UsersController')
const ApplicationController = require('../controllers/ApplicationController')
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication')
const app = express();


app.get('', [verifyToken, verifyAdminRole],  UsersController.index);
app.get('/providers', UsersController.getProviders);
app.get('/students', UsersController.getStundents);
app.get('/:id', [verifyToken, verifyAdminRole, UsersController.userExistsById], UsersController.show);
app.post('', [verifyToken, verifyAdminRole, ApplicationController.userExists], UsersController.create);
app.post('/:id', [verifyToken, UsersController.userExistsById], UsersController.updateImage);
app.put('/:id', [verifyToken,  UsersController.userExistsById], UsersController.update);
app.delete('/:id', [verifyToken, verifyAdminRole, UsersController.prepareToDelete, UsersController.userExistsById], UsersController.desactivate);
app.post('/:id/reactivate', [verifyToken, verifyAdminRole, UsersController.prepareToReactivate, UsersController.userExistsById], UsersController.reactivate);

module.exports = app;
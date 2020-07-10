const express = require('express');
const RolesController = require('../controllers/RolesController');
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication');
const app = express();


app.get('', [verifyToken, verifyAdminRole], RolesController.index);
app.get('/:id', [verifyToken, verifyAdminRole, RolesController.roleExistsById], RolesController.show);
app.post('', [verifyToken, verifyAdminRole, RolesController.roleExistsByName], RolesController.create);
app.put('/:id', [verifyToken, verifyAdminRole, RolesController.roleExistsById], RolesController.update);
app.delete('/:id', [verifyToken, verifyAdminRole, RolesController.prepareToDelete, RolesController.roleExistsById], RolesController.desactivate);
app.post('/:id/reactivate', [verifyToken, verifyAdminRole, RolesController.prepareToReactivate, RolesController.roleExistsById], RolesController.reactivate);


module.exports = app;
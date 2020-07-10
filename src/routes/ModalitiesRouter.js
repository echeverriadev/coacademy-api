const express = require('express');
const ModalitiesController = require('../controllers/ModalitiesController');
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication');
const app = express();


app.get('', ModalitiesController.index);
app.get('/actives', ModalitiesController.indexActives);
app.get('/:id', [verifyToken, verifyAdminRole, ModalitiesController.modalityExistsById], ModalitiesController.show);
app.post('', [verifyToken, verifyAdminRole, ModalitiesController.modalityExistsByName], ModalitiesController.create);
app.put('/:id', [verifyToken, verifyAdminRole, ModalitiesController.modalityExistsById], ModalitiesController.update);
app.delete('/:id', [verifyToken, verifyAdminRole, ModalitiesController.prepareToDelete, ModalitiesController.modalityExistsById], ModalitiesController.desactivate);
app.post('/:id/reactivate', [verifyToken, verifyAdminRole, ModalitiesController.prepareToReactivate, ModalitiesController.modalityExistsById], ModalitiesController.reactivate);


module.exports = app;
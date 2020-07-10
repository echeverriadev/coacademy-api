const express = require('express');
const app = express();

const ApplicationController = require('../controllers/ApplicationController');
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication');

app.post('/login', ApplicationController.login);
app.post('/register', ApplicationController.userExists, ApplicationController.register);
app.post('/changePassword', [verifyToken, ApplicationController.verifyUserPassword], ApplicationController.changePassword);
app.post('/recoverPassword', ApplicationController.recoverPassword);

module.exports = app;
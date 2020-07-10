const express = require('express');
const app = express();

const CoursesController = require('../controllers/CoursesController');
const {verifyToken, verifyAdminRole} = require('../middlewares/Authentication');

app.post('', [verifyToken, verifyAdminRole], CoursesController.uppload);
app.put('/:id', [verifyToken, verifyAdminRole], CoursesController.update);
app.patch('/:id', [verifyToken, verifyAdminRole], CoursesController.updateImage);
app.put('/:id/markAsPopular', [verifyToken, verifyAdminRole], CoursesController.markAsPopular);
app.put('/:id/dismarkAsPopular', [verifyToken, verifyAdminRole], CoursesController.dismarkAsPopular);
app.delete('/:id', [verifyToken, verifyAdminRole], CoursesController.delete);
app.get('', [verifyToken, verifyAdminRole], CoursesController.index);
app.get('/actives', CoursesController.indexActives);
app.get('/categories/filter', CoursesController.getCoursesByCategory);
app.get('/categories/:id/filter', CoursesController.getCoursesByCategoryGiven);
app.get('/modality/:id/filter', CoursesController.getCoursesByModalityGiven);
app.get('/filter', CoursesController.filter);
app.get('/byUser/:id', verifyToken, CoursesController.getCoursesByUser);
app.get('/:id', CoursesController.show);
app.put('/:id/reactivate', [verifyToken, verifyAdminRole], CoursesController.reactivate)
// app.post('/:id/sendBuyRequest', [verifyToken], CoursesController.sendAdminBuyRequest, CoursesController.sendUserBuyRequest); // CALL WEB PAY REQUEST
app.get('/:id/sendBuyRequest', [verifyToken], CoursesController.startWebPayTransaction); // CALL WEB PAY REQUEST
app.post('/webpay-normal/response',  CoursesController.responseWebPay); // CALL REPONSE WEB PAY REQUEST
app.post('/webpay-normal/finish', CoursesController.finish); // CALL FINISH WEB PAY REQUEST UBLOCK COURSE
// app.post('/user/courseUnblock', [verifyToken], CoursesController.unblockCourseToUser)

module.exports = app;
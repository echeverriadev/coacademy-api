const ApplicationRouter = require('./ApplicationRouter');
const UsersRouter = require('./UsersRouter');
const RolesRouter = require('./RolesRouter');
const CategoriesRouter = require('./CategoriesRouter');
const ModalitiesRouter = require('./ModalitiesRouter');
const CoursesRouter = require('./CoursesRouter');
const FileServicesRouter = require('./FileServicesRouter');

exports.load = app => {

  app.use('', ApplicationRouter);
  app.use('/users', UsersRouter);
  app.use('/roles', RolesRouter);
  app.use('/categories', CategoriesRouter);
  app.use('/modalities', ModalitiesRouter);
  app.use('/courses', CoursesRouter);
  app.use('/uploads', FileServicesRouter);
  
  return app;
};

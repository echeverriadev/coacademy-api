'use strict';
const dbConnection = require('../../config/mysql');
const ApplicationTransformer = require('../transformers/ApplicationTransformer');
const CoursesTransformer = require('../transformers/CoursesTransformer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

class UsersController {
  constructor() {
    this.connection = dbConnection();
    this.userTransformer = ApplicationTransformer;
    this.courseTransformer = CoursesTransformer;
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.update = this.update.bind(this);
    this.userExistsById = this.userExistsById.bind(this);
    this.desactivate = this.desactivate.bind(this);
    this.reactivate = this.reactivate.bind(this);
    this.prepareToDelete = this.prepareToDelete.bind(this);
    this.prepareToReactivate = this.prepareToReactivate.bind(this);
    this.getProviders = this.getProviders.bind(this);
    this.getStundents = this.getStundents.bind(this);
  }

  async index(req, res) {
    var SELECT =
      'SELECT users.id, email, user_profile.name, user_profile.description, last_name, password,';
    SELECT +=
      ' phone, picture_url, role_id, role.name as role_name, role.description';
    SELECT +=
      ' as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status,';
    SELECT +=
      ' facebook, instagram, twitter, sex FROM users, user_profile, role WHERE users.role_id = role.id';
    SELECT += ' AND users.id = user_profile.user_id';

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      return res.json({
        status: 200,
        message: 'Usuarios cargados con éxito.',
        users: this.userTransformer.transform(result),
      });
    });
  }

  async getProviders(req, res, next) {
    var SELECT =
      'SELECT users.id, email, user_profile.name, user_profile.description, last_name, password,';
    SELECT +=
      ' phone, picture_url, role_id, role.name as role_name, role.description';
    SELECT +=
      ' as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status,';
    SELECT +=
      ' facebook, instagram, twitter, sex FROM users, user_profile, role WHERE users.role_id = role.id';
    SELECT +=
      ' AND users.id = user_profile.user_id and role.name = "Profesor" ';

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      if (result.length === 0)
        return res.json({
          status: 200,
          message: 'Profesores cargados con éxito.',
          users: [],
        });

      return res.json({
        status: 200,
        message: 'Profesores cargados con éxito.',
        users: this.userTransformer.transform(result),
      });
    });
  }

  async getStundents(req, res, next) {
    var SELECT =
      'SELECT users.id, email, user_profile.name, last_name, password,';
    SELECT +=
      ' phone, picture_url, role_id, role.name as role_name, role.description';
    SELECT +=
      ' as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status,';
    SELECT +=
      ' facebook, instagram, twitter, sex FROM users, user_profile, role WHERE users.role_id = role.id';
    SELECT +=
      ' AND users.id = user_profile.user_id and role.name = "Estudiante" ';

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      if (result.length === 0)
        return res.json({
          status: 200,
          message: 'Estudiantes cargados con éxito.',
          users: [],
        });

      return res.json({
        status: 200,
        message: 'Estudiantes cargados con éxito.',
        users: this.userTransformer.transform(result),
      });
    });
  }

  async userExistsById(req, res, next) {
    const id = req.params.id;

    if (!id)
      return res.json({
        status: 500,
        message: 'El id es necesario.',
      });

    var SELECT = 'SELECT * from users WHERE id = ' + id;

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      if (result.length === 0)
        return res.json({
          status: 500,
          message: 'El usuario no existe',
        });

      next();
    });
  }

  async show(req, res) {
    const id = req.params.id;

    var SELECT =
      'SELECT users.id, email, user_profile.name, user_profile.description, last_name, password,';
    SELECT +=
      ' phone, picture_url, role_id, role.name as role_name, role.description';
    SELECT +=
      ' as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status,';
    SELECT +=
      ' facebook, instagram, twitter, sex FROM users, user_profile, role WHERE users.role_id = role.id';
    SELECT += ' AND users.id = user_profile.user_id AND users.id = ' + id;

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      return res.json({
        status: 200,
        message: 'Usuario cargado con éxito.',
        users: this.userTransformer.transform(result[0]),
      });
    });
  }

  async create(req, res) {
    const body = req.body;

    if (
      Object.keys(body).length === 0 ||
      body.constructor !== Object ||
      body === '' ||
      body === null ||
      body === undefined
    ) {
      return res.json({
        status: 500,
        message: 'Ingrese datos',
      });
    }

    if (
      body.email === '' ||
      body.email === undefined ||
      body.email === null ||
      body.password === '' ||
      body.password === undefined ||
      body.password === null ||
      body.confirm_password === '' ||
      body.confirm_password === undefined ||
      body.confirm_password === null
    ) {
      return res.json({
        status: 500,
        message: 'Ingrese email, contraseña, su confirmación y el teléfono',
      });
    }

    if (body.password !== body.confirm_password) {
      return res.json({
        status: 500,
        message: 'La contraseña debe ser igual a la de confirmación',
      });
    }

    //upload image
    let new_image_name = null;

    if (req.files) {
      let image = req.files.image;
      let allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
      let short_name = image.name.split('.');
      let extension = short_name[short_name.length - 1];

      if (allowed_extensions.indexOf(extension) < 0) {
        return res.json({
          status: 500,
          message:
            'Formato de archivo no válido, las extensiones permitidas son ' +
            allowed_extensions.join(', '),
        });
      }

      new_image_name = `${new Date().getMilliseconds()}.${extension}`;

      image.mv(
        path.resolve(__dirname, '../../public/uploads/users/' + new_image_name),
        (err) => {
          if (err)
            return res.status(500).json({
              status: 500,
              err,
            });
        }
      );
    }

    let data = {
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      role_id: req.body.role_id || null,
      name: req.body.name || null,
      last_name: req.body.last_name || null,
      twitter: req.body.twitter || null,
      facebook: req.body.facebook || null,
      instagram: req.body.instagram || null,
      phone: req.body.phone || null,
      sex: req.body.sex || '',
      description: req.body.description || '',
    };

    var INSERT = `INSERT INTO users(email, password, confirm_password`;

    if (data.role_id) {
      INSERT += `, role_id) VALUES('${data.email}', '${bcrypt.hashSync(
        data.password,
        10
      )}', '${bcrypt.hashSync(data.confirm_password, 10)}', '${
        data.role_id
      }' )`;
    } else {
      INSERT += `) VALUES('${data.email}', '${bcrypt.hashSync(
        data.password,
        10
      )}', '${bcrypt.hashSync(data.confirm_password, 10)}')`;
    }

    this.connection.query(INSERT, (err, result) => {
      if (err) {
        return res.json({
          status: 500,
          err,
        });
      }

      var INSERT_PROFILE = `INSERT INTO user_profile(user_id, name, last_name, picture_url, twitter, facebook, instagram, phone, sex, description)`;
      INSERT_PROFILE += `VALUES('${result.insertId}', '${data.name}', '${data.last_name}', '${new_image_name}', '${data.twitter}', '${data.facebook}', '${data.instagram}', '${data.phone}', '${data.sex}', '${data.description}')`;

      this.connection.query(INSERT_PROFILE, (err, resultProfile) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        this.connection.query(
          `SELECT users.id, email, user_profile.name, user_profile.description, user_profile.last_name, password, user_profile.phone, user_profile.description, user_profile.picture_url, role_id, role.name as role_name, role.description as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status, user_profile.facebook, user_profile.instagram, user_profile.twitter, user_profile.sex FROM users, user_profile, role WHERE users.role_id = role.id AND users.id = user_profile.user_id and users.id = '${result.insertId}'`,
          (err, resultGet) => {
            if (err) {
              return res.status(500).json({
                status: 500,
                err,
              });
            }

            return res.status(200).json({
              status: 200,
              message: 'Usuario creado exitosamente',
              user: this.userTransformer.transform(resultGet[0]),
            });
          }
        );
      });
    });
  }

  async updateImage(req, res) {
    const id = req.params.id;

    if (!req.files)
      return res.status(400).json({
        status: 400,
        message: 'No se ha seleccionado ningún archivo',
      });

    let image = req.files.image;
    let allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    let short_name = image.name.split('.');
    let extension = short_name[short_name.length - 1];

    if (allowed_extensions.indexOf(extension) < 0) {
      return res.json({
        status: 500,
        message:
          'Formato de archivo no válido, las extensiones permitidas son ' +
          allowed_extensions.join(', '),
      });
    }

    this.connection.query(
      'SELECT picture_url FROM user_profile WHERE user_id = ?',
      id,
      (err, resultImage) => {
        if (err)
          return res.status(500).json({
            status: 500,
            err,
          });

        let image_name = resultImage[0].picture_url;
        let pathImage = path.resolve(
          __dirname,
          `../../public/uploads/users/${image_name}`
        );
        if (fs.existsSync(pathImage)) {
          fs.unlinkSync(pathImage);
        }
      }
    );

    let new_image_name = `${
      req.params.id
    }-${new Date().getMilliseconds()}.${extension}`;

    image.mv(
      path.resolve(__dirname, 'public/uploads/users/' + new_image_name),
      (err) => {
        if (err)
          return res.status(500).json({
            status: 500,
            err,
          });

        this.connection.query(
          `UPDATE user_profile SET picture_url = '${new_image_name}' where user_id = ${id} `,
          (errsql, result) => {
            if (errsql)
              return res.status(500).json({
                status: 500,
                err,
              });

            return res.status(200).json({
              status: 200,
              message: 'Se ha subido con exito la imágen',
              image: new_image_name,
            });
          }
        );
      }
    );
  }

  async update(req, res, next) {
    const id = req.params.id;
    const body = req.body;

    if (
      Object.keys(body).length === 0 ||
      body.constructor !== Object ||
      body === '' ||
      body === null ||
      body === undefined
    ) {
      return res.status(200).json({
        status: 500,
        message: 'Ingrese datos',
      });
    }

    this.connection.query(
      `UPDATE users as usr, user_profile as up SET ? WHERE up.user_id = usr.id AND usr.id = ${id} `,
      body,
      (err, resultUpdate) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        this.connection.query(
          `SELECT users.id, email, user_profile.name, user_profile.adress, user_profile.description, user_profile.last_name, user_profile.linkedin, password, user_profile.phone, user_profile.picture_url, role_id, role.name as role_name, role.description as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status, user_profile.facebook, user_profile.instagram, user_profile.twitter, user_profile.sex FROM users, user_profile, role WHERE users.role_id = role.id AND users.id = user_profile.user_id and users.id = ${id}`,
          (err, resultGet) => {
            if (err) {
              return res.status(500).json({
                status: 500,
                err,
              });
            }

            return res.status(200).json({
              status: 200,
              message: 'Datos del usuario actualizados correctamente',
              user: this.userTransformer.transform(resultGet[0]),
            });
          }
        );
      }
    );
  }

  async desactivate(req, res, next) {
    const id = req.params.id;

    this.connection.query(
      `UPDATE users, user_profile SET users.status=\'2\', user_profile.status=\'2\' WHERE users.id = user_profile.user_id AND users.id = ${id} `,
      (err, result) => {
        if (err) {
          res.status(500).json({
            status: 500,
            err,
          });
        }

        return res.status(200).json({
          status: 200,
          message: 'Se ha desactivado el usuario con éxito',
        });
      }
    );
  }

  async reactivate(req, res, next) {
    const id = req.params.id;

    this.connection.query(
      `UPDATE users, user_profile SET users.status=\'1\', user_profile.status=\'1\' WHERE users.id = user_profile.user_id AND users.id = ${id} `,
      (err, result) => {
        if (err) {
          res.status(500).json({
            status: 500,
            err,
          });
        }

        return res.status(200).json({
          status: 200,
          message: 'Se ha activado el usuario con éxito',
        });
      }
    );
  }

  async prepareToDelete(req, res, next) {
    const id = req.params.id;

    if (!id) {
      return res.json({
        status: 500,
        message: 'ingrese un id',
      });
    }

    this.connection.query(
      `SELECT * FROM users WHERE id = '${id}'`,
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        if (result.length === 0) {
          return res.status(200).json({
            status: 500,
            message: 'El usuario no existe',
          });
        }

        if (parseInt(result[0].status, 10) === 2) {
          return res.status(200).json({
            status: 500,
            message: 'El usuario ya se encuentra inactivo',
          });
        }

        next();
      }
    );
  }

  async prepareToReactivate(req, res, next) {
    const id = req.params.id;

    if (!id) {
      return res.json({
        status: 500,
        message: 'ingrese un id',
      });
    }

    this.connection.query(
      `SELECT * FROM users WHERE id = '${id}'`,
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        if (result.length === 0) {
          return res.status(200).json({
            status: 500,
            message: 'El usuario no existe',
          });
        }

        if (parseInt(result[0].status, 10) === 1) {
          return res.status(200).json({
            status: 500,
            message: 'El usuario ya se encuentra activo',
          });
        }

        next();
      }
    );
  }
}

module.exports = new UsersController();

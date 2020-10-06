"use strict";
const dbConnection = require("../../config/mysql");
const ApplicationTransformer = require("../transformers/ApplicationTransformer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

class ApplicationController {
  constructor() {
    this.connection = dbConnection();
    this.applicationTransformer = ApplicationTransformer;
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.userExists = this.userExists.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.verifyUserPassword = this.verifyUserPassword.bind(this);
    this.recoverPassword = this.recoverPassword.bind(this);
  }

  async login(req, res, next) {
    let { email, password } = req.body;

    if (
      email === null ||
      email === undefined ||
      password === null ||
      password === undefined
    ) {
      return res.json({
        status: 500,
        message: "Disculpe, el email y la contraseña son necesarios",
      });
    }

    this.connection.query(
      `SELECT users.id, email, user_profile.description, user_profile.adress, user_profile.name as name, last_name, password, phone, picture_url, role_id, role.name as role_name, role.description as role_description, role.status as role_status, users.status as user_status, user_profile.status as user_profile_status, facebook, instagram, twitter, linkedin, sex FROM users, user_profile, role WHERE users.role_id = role.id AND users.id = user_profile.user_id and email = '${email}'`,
      (err, result) => {
        console.log(err, result);
        if (err) {
          return res.status(500).json({ error: err });
        }

        if (
          result.length === 0 ||
          !bcrypt.compareSync(password, result[0].password)
        ) {
          return res.json({
            status: 500,
            message: "Usuario o contraseña incorrectos",
          });
        }

        if (parseInt(result[0].user_status) !== 1) {
          return res.status(200).json({
            status: 500,
            message: "El usuario se encuentra inactivo",
          });
        }

        let session_token = jwt.sign(
          {
            usuario: result[0],
          },
          process.env.SEED
        );

        res.status(200).json({
          status: 200,
          massage: "User Found",
          user: this.applicationTransformer.transform(result[0]),
          token: session_token,
        });
      }
    );
  }

  async userExists(req, res, next) {
    const { email } = req.body;

    req.checkBody("email", "Ingrese un email").notEmpty();
    let errors = req.validationErrors();

    if (errors) {
      return res.json({
        status: 400,
        errors,
      });
    }

    this.connection.query(
      `SELECT * FROM users WHERE email = '${email}'`,
      (err, resultGet) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        if (resultGet.length !== 0) {
          return res.json({
            status: 500,
            message: "Usuario ya ha sido registrado con ese email",
          });
        }

        next();
      }
    );
  }

  async register(req, res, next) {
    const body = req.body;

    if (
      Object.keys(body).length === 0 ||
      body.constructor !== Object ||
      body === "" ||
      body === null ||
      body === undefined
    ) {
      return res.json({
        status: 500,
        message: "Ingrese datos",
      });
    }

    if (
      body.email === "" ||
      body.email === undefined ||
      body.email === null ||
      body.password === "" ||
      body.password === undefined ||
      body.password === null ||
      body.confirm_password === "" ||
      body.confirm_password === undefined ||
      body.confirm_password === null
    ) {
      return res.json({
        status: 500,
        message: "Ingrese contraseña y su confirmación",
      });
    }

    if (body.password !== body.confirm_password) {
      return res.json({
        status: 500,
        message: "La contraseña debe ser igual a la de confirmación",
      });
    }

    let { email, password, confirm_password } = body;
    let { name, lastname, phone, sex, adress, description } = body.user_profile;

    //config mail
    var transporter = nodemailer.createTransport({
      host: "smtp.mandrillapp.com",
      secure: false,
      port: 587,
      auth: {
        type: "login",
        user: "cursos@colaboral.com",
        pass: "coacademy2020",
      },
      logger: true, // log to console
    });

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".hbs",
          partialsDir: path.resolve(__dirname, `../templates/`),
          layoutsDir: path.resolve(__dirname, `../templates/`),
          defaultLayout: "Welcome",
        },
        viewPath: path.resolve(__dirname, `../templates/`),
      })
    );

    var mailOptions = {
      to: email,
      from: "cursos@colaboral.com", //change this
      subject: "Bienvenido a Colaboral.",
      context: {
        password: password,
        email: email,
      },
      attachments: [
        {
          filename: "image1",
          path: path.resolve(
            __dirname,
            `../templates/images/colaboral-color.png`
          ),
          cid: "image1@image",
        },
      ],
      template: "Welcome",
    };

    await transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.log(error);
        return res.json({ status: 500, message: "No se pudo enviar el email" });
      } else {
        console.log(password, "success");
      }
    });

    this.connection.query(
      `INSERT INTO users(email, password, confirm_password) VALUES('${email}', '${bcrypt.hashSync(
        password,
        10
      )}', '${bcrypt.hashSync(confirm_password, 10)}')`,
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        this.connection.query(
          `INSERT INTO user_profile(user_id, name, last_name, phone, sex, adress, description) VALUES('${
            result.insertId
          }', '${name}', '${lastname}', '${phone}', '${sex}', '${adress}', '${
            description ? description : ""
          }')`,
          (err, resultProfile) => {
            if (err) {
              return res.status(500).json({
                status: 500,
                err,
              });
            }

            this.connection.query(
              `SELECT user.id, email, user_profile.name, last_name, phone, picture_url, role.id as role_id, role.name as role_name, role.status as role_status, role.description as role_description, user.status as user_status, user_profile.status as user_profile_status, facebook, instagram, twitter, sex FROM users as user, user_profile, role WHERE user.id = user_profile.user_id AND user.role_id = role.id  AND user.id = ${result.insertId}`,
              (err, resultGet) => {
                if (err) {
                  return res.status(500).json({
                    status: 500,
                    err,
                  });
                }

                console.log(resultGet[0]);

                return res.status(200).json({
                  status: 200,
                  message: "Usuario registrado exitosamente.",
                  user: this.applicationTransformer.transform(resultGet[0]),
                });
              }
            );
          }
        );
      }
    );
  }

  async verifyUserPassword(req, res, next) {
    const { email, password } = req.body;

    req.checkBody("password", "Password is required").notEmpty();
    let errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({
        status: 400,
        errors,
      });
    }

    this.connection.query(
      `SELECT * FROM users as user WHERE email = '${email}'`,
      (err, resultGet) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        if (!bcrypt.compareSync(password, resultGet[0].password)) {
          return res.json({
            status: 500,
            message: "Contraseña incorrecta",
          });
        }
        next();
      }
    );
  }

  async changePassword(req, res) {
    const { email, password, new_password, confirm_password } = req.body;

    req.checkBody("new_password", "Ingrese la nueva contraseña.").notEmpty();
    req
      .checkBody("confirm_password", "Ingrese la contraseña de confirmación.")
      .notEmpty();
    req
      .checkBody(
        "confirm_password",
        "la contraseña y la de confirmación deben ser iguales"
      )
      .equals(req.body.new_password);
    let errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({
        status: 400,
        errors,
      });
    }

    this.connection.query(
      `UPDATE users SET password = '${bcrypt.hashSync(
        new_password,
        10
      )}', confirm_password = '${bcrypt.hashSync(
        new_password,
        10
      )}' WHERE email = '${email}'`,
      (err, resultGet) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            err,
          });
        }

        return res.status(200).json({
          status: 200,
          message: "Contraseña cambiada con éxito",
        });
      }
    );
  }

  async recoverPassword(req, res) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    const email = req.body.email;
    req.checkBody("email", "El email es necesario.").notEmpty();
    req.checkBody("email", "Email no posee un formato válido").isEmail();
    let errors = req.validationErrors();

    if (errors) {
      return res.status(400).send(errors);
    }

    let user = await query(`SELECT id FROM users WHERE email= '${email}'`);

    if (user.length === 0)
      return res.json({
        status: 404,
        message: "El usuario no se encuentra registrado.",
      });

    // New password generated
    let generated_password = Math.random().toString(36).slice(-8);

    //config mail
    var transporter = nodemailer.createTransport({
      host: "smtp.mandrillapp.com",
      secure: false,
      port: 587,
      auth: {
        type: "login",
        user: "cursos@colaboral.com",
        pass: "coacademy2020",
      },
      logger: true, // log to console
    });

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".hbs",
          partialsDir: path.resolve(__dirname, `../templates/`),
          layoutsDir: path.resolve(__dirname, `../templates/`),
          defaultLayout: "ChangePassword",
        },
        viewPath: path.resolve(__dirname, `../templates/`),
      })
    );

    var mailOptions = {
      to: email,
      from: "me", //change this
      subject: "Reinicio de contraseña.",
      context: {
        password: generated_password,
        email: email,
      },
      attachments: [
        {
          filename: "image1",
          path: path.resolve(
            __dirname,
            `../templates/images/colaboral-color.png`
          ),
          cid: "image1@image",
        },
      ],
      template: "ChangePassword",
    };

    transporter.sendMail(mailOptions, async function (error) {
      if (error) {
        console.log(error);
        return res.json({ status: 500, message: "No se pudo enviar el email" });
      } else {
        console.log(generated_password);
        await query(
          `UPDATE users SET password='${bcrypt.hashSync(
            generated_password,
            10
          )}', confirm_password='${bcrypt.hashSync(
            generated_password,
            10
          )}' WHERE email='${email}'`
        );
        return res.json({
          status: 200,
          message: `Se ha enviado una nueva contraseña a: ${email}`,
        });
      }
    });
  }
}

module.exports = new ApplicationController();

'use strict';
const dbConnection = require('../../config/mysql');
const CoursesTransformer = require('../transformers/CoursesTransformer');
const util = require('util');
const { addDayWithoutFormat, dateParse } = require('../utils/dateParse');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const webPay = require('../../config/webPay');
var transactions = {};
require('../../config/enviroments');

class CoursesController {
  constructor() {
    this.connection = dbConnection();
    this.coursesTransformer = CoursesTransformer;
    this.uppload = this.uppload.bind(this);
    this.update = this.update.bind(this);
    this.validURL = this.validURL.bind(this);
    this.show = this.show.bind(this);
    this.index = this.index.bind(this);
    this.indexActives = this.indexActives.bind(this);
    this.getCoursesByCategory = this.getCoursesByCategory.bind(this);
    this.getCoursesByCategoryGiven = this.getCoursesByCategoryGiven.bind(this);
    this.getCoursesByModalityGiven = this.getCoursesByModalityGiven.bind(this);
    this.getCoursesByUser = this.getCoursesByUser.bind(this);
    this.getCoursesByModalityAndCategoryGiven = this.getCoursesByModalityAndCategoryGiven.bind(
      this
    );
    this.filter = this.filter.bind(this);
    this.markAsPopular = this.markAsPopular.bind(this);
    this.dismarkAsPopular = this.dismarkAsPopular.bind(this);
    this.delete = this.delete.bind(this);
    this.reactivate = this.reactivate.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.sendUserBuyRequest = this.sendUserBuyRequest.bind(this);
    this.sendAdminBuyRequest = this.sendAdminBuyRequest.bind(this);
    this.unblockCourseToUser = this.unblockCourseToUser.bind(this);
    this.getUserOrderCount = this.getUserOrderCount.bind(this);
    this.startWebPayTransaction = this.startWebPayTransaction.bind(this);
    this.responseWebPay = this.responseWebPay.bind(this);
    this.finish = this.finish.bind(this);
  }

  validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }

  async getUserOrderCount(req) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    let result = await query(
      `SELECT COUNT(*) as orderCount FROM course_user WHERE user_id=${req.usuario.id}`
    );

    if (result[0].orderCount === 0) result[0].orderCount = 1;

    return result[0].orderCount;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  async startWebPayTransaction(req, res) {
    
    let Webpay = webPay();
    let url = process.env.NODE_URL || 'http://localhost:3000';
    const query = util.promisify(this.connection.query).bind(this.connection);
    let result = await query(`SELECT * FROM course WHERE id=${req.params.id} limit 1;`);
    let amount = (result[0].is_in_offer !== '2')? result[0].offer_price : result[0].price 
    let orderCount =  await this.getUserOrderCount(req)

    Webpay.initTransaction(
      amount,
      'Orden ' + orderCount.toString(),
      req.sessionId,
      url + '/courses/webpay-normal/response',
      url + '/courses/webpay-normal/finish'
    ).then((data) => {
      transactions[data.token] = { amount: amount, user: req.usuario.id, course: result[0].id, email: req.usuario.email }
      res.json({ url: data.url, token: data.token, inputName: 'TBK_TOKEN' });
    });
    
  }

  async responseWebPay(req, res) {
    let Webpay = webPay();

    let token = Object.keys(transactions)[0];

    Webpay.getTransactionResult(token)
      .then((response) => {
        transactions[token] = Object.assign({},transactions[token],{
          ...response
        })  

        return Webpay.generalAcknowledgeTransaction(token);
      })
      .then((result) => {
        console.log(result);
        res.render('redirect-transbank', {
          url: response.urlRedirection,
          token,
          inputName: 'token_ws',
        });
      })
      .catch((e) => {
        console.log(e)
        res.send('Error');
      });
  }

  async finish(req, res) {
    let status = null;
    let transaction = null;

    let token = Object.keys(transactions)[0];

    // Si se recibe TBK_TOKEN en vez de token_ws, la compra fue anulada por el usuario
    if (typeof req.body.TBK_TOKEN !== 'undefined') {
      status = 'ABORTED';
    }

    if (typeof token !== 'undefined') {
      transaction = transactions[token];
      if (transaction && transaction.detailOutput && transaction.detailOutput[0] && transaction.detailOutput[0].responseCode === 0) {
        status = 'AUTHORIZED';
        const query = util.promisify(this.connection.query).bind(this.connection);

        // User-Course association 
        query(
          `INSERT INTO course_user(user_id, course_id, status) VALUES(${transaction.user}, ${transaction.course}, '1')`,
          (err, result) => {
            if (err) console.log(err);
          }
        )

        //Send email to admin

        req.params.user_id = transaction.user
        req.params.course_id = transaction.course

        this.sendAdminBuyRequest(req, res);
        this.sendUserBuyRequest(req, res);

      } else {
        status = 'REJECTED';
      }
    }

    // Si no se recibió ni token_ws ni TBK_TOKEN, es un usuario que entró directo
    if (status === null) {
      return res.status(404).send('Not found.');
    }
    delete transactions[token]
    return res.render('finish', { transaction, status });
  }


  async sendAdminBuyRequest(req, res, next) {
    const { user_id, course_id } = req.params;

    const query = util.promisify(this.connection.query).bind(this.connection);

    const user = await query(
      `SELECT users.id, email, name, phone, adress FROM users, user_profile WHERE user_profile.user_id = users.id and users.id='${user_id}'`
    );

    const course = await query(`SELECT id, name FROM course WHERE id=${course_id}`);

    //config mail
    var transporter = nodemailer.createTransport({
      host: 'smtp.mandrillapp.com',
      secure: false,
      port: 587,
      auth: {
        type: 'login',
        user: 'cursos@colaboral.com',
        pass: 'coacademy2020',
      },
      logger: true, // log to console
    });

    transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extName: '.hbs',
          partialsDir: path.resolve(__dirname, `../templates/`),
          layoutsDir: path.resolve(__dirname, `../templates/`),
          defaultLayout: 'BuyAdminCourseRequest',
        },
        viewPath: path.resolve(__dirname, `../templates/`),
      })
    );

    var mailOptionsAdmin = {
      to: 'cursos@colaboral.com',
      from: 'cursos@colaboral.com',
      subject: `Solicitud de compra del curso ${course[0].name} usuario ${user[0].email}.`,
      context: {
        course_name: course[0].name,
        email: user[0].email
      },
      attachments: [
        {
          filename: 'image1',
          path: path.resolve(
            __dirname,
            `../templates/images/colaboral-color.png`
          ),
          cid: 'image1@image',
        },
      ],
      template: 'BuyAdminCourseRequest',
    };

    transporter.sendMail(mailOptionsAdmin, async function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log(user[0].email, 'success');
      }
    });
  }

  async sendUserBuyRequest(req, res) {
    const { user_id, course_id } = req.params;

    const query = util.promisify(this.connection.query).bind(this.connection);

    const user = await query(
      `SELECT users.id, name, email, phone, adress FROM users, user_profile WHERE user_profile.user_id = users.id and users.id='${user_id}'`
    );
    
    const course = await query(
      `SELECT id, name, is_in_offer, price, offer_price FROM course WHERE id=${course_id}`
    );

    //config mail
    var transporter = nodemailer.createTransport({
      host: 'smtp.mandrillapp.com',
      secure: false,
      port: 587,
      auth: {
        type: 'login',
        user: 'cursos@colaboral.com',
        pass: 'coacademy2020',
      },
      logger: true, // log to console
    });

    transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extName: '.hbs',
          partialsDir: path.resolve(__dirname, `../templates/`),
          layoutsDir: path.resolve(__dirname, `../templates/`),
          defaultLayout: 'BuyUserCourseRequest',
        },
        viewPath: path.resolve(__dirname, `../templates/`),
      })
    );

    const price =
      parseInt(course[0].is_in_offer, 10) === 1
        ? course[0].offer_price
        : course[0].price;

    let email = user[0].email

    var mailOptionsUser = {
      to: email,
      from: 'me', //change this
      subject: `Solicitud de compra del curso ${course[0].name}.`,
      context: {
        email,
        course_name: course[0].name,
        course_price: price,
      },
      attachments: [
        {
          filename: 'image1',
          path: path.resolve(
            __dirname,
            `../templates/images/colaboral-color.png`
          ),
          cid: 'image1@image',
        },
      ],
      template: 'BuyUserCourseRequest',
    };

    transporter.sendMail(mailOptionsUser, async function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log(email, 'success');
      }
    });
  }
  
  async uppload(req, res, next) {
    req.body = JSON.parse(req.body.course);

    let {
      name,
      description,
      provider,
      price,
      begin_date,
      end_date,
      category_id,
      modality_id,
      user_id,
      link_media,
      duration,
      with_date,
      is_important,
      is_in_offer,
      offer_price,
    } = req.body;

    req.checkBody('name', 'El titulo es requerido.').notEmpty();
    req
      .checkBody('provider', 'El nombre del profesor es necesario.')
      .notEmpty();
    if (is_in_offer === '1') {
      req
        .checkBody('offer_price', 'El precio de oferta del curso es necesario.')
        .notEmpty();
    }
    req.checkBody('price', 'El precio del curso es necesario.').notEmpty();
    if (with_date === '1') {
      req
        .checkBody('begin_date', 'La fecha de inicio es necesaria.')
        .notEmpty();
      req
        .checkBody('end_date', 'La fecha de culminación es necesaria.')
        .notEmpty();
    }
    req
      .checkBody(
        'category_id',
        'La categoria a la que pertenece el curso es necesaria.'
      )
      .notEmpty();
    req
      .checkBody('modality_id', 'La modalidad del curso es necesaria.')
      .notEmpty();
    req
      .checkBody('user_id', 'El usuario quien sube el curso es necesario.')
      .notEmpty();
    req.checkBody('link_media', 'El link del curso es requerido.').notEmpty();
    req.checkBody('duration', 'La duración del curso es requerida.').notEmpty();
    let errors = req.validationErrors();

    if (errors)
      return res.status(200).json({
        status: 500,
        errors,
      });

    var date_begin;
    var date_end;

    if (with_date === '1') {
      date_begin = addDayWithoutFormat(begin_date);
      date_end = addDayWithoutFormat(end_date);

      if (date_begin < addDayWithoutFormat(dateParse(new Date())))
        return res.json({
          status: 500,
          message:
            'Disculpe, la fecha de inicio debe ser mayor o igual a la actual.',
        });

      if (date_begin > date_end)
        return res.json({
          status: 500,
          message:
            'Disculpe, la fecha de finalización debe ser mayor a la de inicio.',
        });
    } else {
      date_begin = null;
      date_end = null;
    }

    if (!this.validURL(link_media))
      return res.json({
        status: 500,
        message:
          'Ingrese un link válido, recuerde que este será el link de accesso al curso.',
      });

    if (!req.files.image)
      return res.json({
        status: 500,
        message: 'Suba una imagen promocional.',
      });

    let new_image_name = '';
    let new_pdf_name = '';

    // Upload promotional image

    let preview_image = req.files.image;
    let allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
    let short_name = preview_image.name.split('.');
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

    preview_image.mv(
      path.resolve(
        __dirname,
        '../../public/uploads/courses/images/' + new_image_name
      ),
      (err) => {
        if (err)
          return res.status(500).json({
            status: 500,
            err,
          });
      }
    );

    // Upload pdf description if it exists
    if (req.files.document_description) {
      let pdf_name = req.files.document_description;
      let pdf_allowed_extensions = ['pdf'];
      let pdf_short_name = pdf_name.name.split('.');
      let pdf_extension = pdf_short_name[pdf_short_name.length - 1];

      if (pdf_allowed_extensions.indexOf(pdf_extension) < 0) {
        return res.json({
          status: 500,
          message:
            'Formato de archivo no válido, la extensión del archivo debe ser pdf',
        });
      }

      new_pdf_name = `${new Date().getMilliseconds()}.${pdf_extension}`;

      pdf_name.mv(
        path.resolve(
          __dirname,
          '../../public/uploads/courses/pdfs/' + new_pdf_name
        ),
        (err) => {
          if (err)
            return res.status(200).json({
              status: 500,
              err,
            });
        }
      );
    }

    let insert = `INSERT INTO course(`;
    insert += `name, provider, description, duration, price, begin_date, end_date, category_id,`;
    insert += `modality_id, user_id, link_media, image, document_description, is_important, is_in_offer, offer_price, with_date, status) VALUES('${name}', ${provider},`;
    insert += `'${description}', ${duration}, ${price}, ${this.connection.escape(
      date_begin
    )}, ${this.connection.escape(date_end)},`;
    insert += `${category_id}, ${modality_id}, ${user_id}, '${link_media}', '${new_image_name}', '${new_pdf_name}', '${is_important}', '${is_in_offer}', ${offer_price}, '${with_date}', 2)`;

    this.connection.query(insert, (err, result) => {
      if (err)
        return res.status(200).json({
          status: 500,
          err,
        });

      let SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex, u2p.description as provider_description,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id and m.status = 1 and c.status = 1 AND course.id = ? ';

      this.connection.query(SELECT, result.insertId, (err, resultGet) => {
        if (err)
          return res.status(200).json({
            status: 500,
            err,
          });

        return res.json({
          status: 200,
          message: 'Curso cargado con exito',
          course: CoursesTransformer.transform(resultGet[0]),
        });
      });
    });
  }

  async update(req, res, next) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    const course = await query(
      `SELECT id, document_description, name FROM course WHERE id=${id}`
    );

    if (!course[0])
      return res.json({
        status: 402,
        message: 'El curso ya no se encuentra disponible.',
      });

    course[0].document_description = course[0].document_description || null;

    req.body = JSON.parse(req.body.course);

    var {
      name,
      description,
      provider,
      price,
      begin_date,
      end_date,
      category_id,
      modality_id,
      user_id,
      link_media,
      duration,
      with_date,
      is_important,
      is_in_offer,
      offer_price,
    } = req.body;

    req.checkBody('name', 'El titulo es requerido.').notEmpty();
    req
      .checkBody('provider', 'El nombre del profesor es necesario.')
      .notEmpty();
    if (is_in_offer === '1') {
      req
        .checkBody('offer_price', 'El precio de oferta del curso es necesario.')
        .notEmpty();
    }
    req.checkBody('price', 'El precio del curso es necesario.').notEmpty();
    if (with_date === '1') {
      req
        .checkBody('begin_date', 'La fecha de inicio es necesaria.')
        .notEmpty();
      req
        .checkBody('end_date', 'La fecha de culminación es necesaria.')
        .notEmpty();
    }
    req
      .checkBody(
        'category_id',
        'La categoria a la que pertenece el curso es necesaria.'
      )
      .notEmpty();
    req
      .checkBody('modality_id', 'La modalidad del curso es necesaria.')
      .notEmpty();
    req
      .checkBody('user_id', 'El usuario quien sube el curso es necesario.')
      .notEmpty();
    req.checkBody('link_media', 'El link del curso es requerido.').notEmpty();
    req.checkBody('duration', 'La duración del curso es requerida.').notEmpty();
    let errors = req.validationErrors();

    if (errors)
      return res.status(200).json({
        status: 500,
        errors,
      });

    if (with_date === '1') {
      req.body.begin_date = addDayWithoutFormat(begin_date);
      req.body.end_date = addDayWithoutFormat(end_date);

      if (req.body.begin_date < addDayWithoutFormat(dateParse(new Date())))
        return res.json({
          status: 500,
          message:
            'Disculpe, la fecha de inicio debe ser mayor o igual a la actual.',
        });

      if (req.body.begin_date > req.body.end_date)
        return res.json({
          status: 500,
          message:
            'Disculpe, la fecha de finalización debe ser mayor a la de inicio.',
        });
    } else {
      req.body.begin_date = null;
      req.body.end_date = null;
    }

    if (!this.validURL(link_media))
      return res.json({
        status: 500,
        message:
          'Ingrese un link válido, recuerde que este será el link de accesso al curso.',
      });

    let new_pdf_name = '';

    // Upload pdf description if it exists
    if (req.files && req.files.document_description) {
      let pdf_name = req.files.document_description;
      let pdf_allowed_extensions = ['pdf'];
      let pdf_short_name = pdf_name.name.split('.');
      let pdf_extension = pdf_short_name[pdf_short_name.length - 1];

      if (pdf_allowed_extensions.indexOf(pdf_extension) < 0) {
        return res.json({
          status: 500,
          message:
            'Formato de archivo no válido, la extensión del archivo debe ser pdf',
        });
      }

      let pathImage = path.resolve(
        __dirname,
        `../../public/uploads/courses/pdfs/${course[0].document_description}`
      );
      if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage);
      }

      new_pdf_name = `${id}-${new Date().getMilliseconds()}.${pdf_extension}`;

      pdf_name.mv(
        path.resolve(
          __dirname,
          '../../public/uploads/courses/pdfs/' + new_pdf_name
        ),
        (err) => {
          if (err)
            return res.status(200).json({
              status: 500,
              err,
            });
        }
      );

      req.body.document_description = new_pdf_name;
    }

    let update = `UPDATE course SET ? where id = ${id}`;

    this.connection.query(update, req.body, (err, result) => {
      if (err)
        return res.status(200).json({
          status: 500,
          err,
        });

      let SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex, u2p.description as provider_description,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id and m.status = 1 and c.status = 1 AND course.id = ? ';

      this.connection.query(SELECT, id, (err, resultGet) => {
        if (err)
          return res.status(200).json({
            status: 500,
            err,
          });

        return res.json({
          status: 200,
          message: 'Curso modificado con exito',
          course: CoursesTransformer.transform(resultGet[0]),
        });
      });
    });
  }

  async filter(req, res) {
    const { category_id, modality_id, name } = req.query;

    var SELECT = '';

    if (!category_id && !modality_id && !name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND course.status = 1 ';
    }

    if (category_id && !modality_id && !name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND c.id = ' +
        category_id +
        ' AND course.status = 1';
    }

    if (!category_id && modality_id && !name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND m.id = ' +
        modality_id +
        ' AND course.status = 1';
    }

    if (!category_id && !modality_id && name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT += `AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND course.status = 1 AND course.name LIKE '%${name}%'`;
    }

    if (category_id && !modality_id && name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT += `AND course.category_id = c.id AND c.id = ${category_id} AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND course.status = 1 AND course.name LIKE '%${name}%'`;
    }

    if (!category_id && modality_id && name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT += `AND course.category_id = c.id AND course.modality_id = m.id AND course.modality_id = ${modality_id} AND m.status = 1 AND c.status = 1 AND course.status = 1 AND course.name LIKE '%${name}%'`;
    }

    if (category_id && modality_id && !name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND m.id = ' +
        modality_id +
        ' AND c.id = ' +
        category_id +
        ' AND course.status = 1';
    }

    if (category_id && modality_id && name) {
      SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT += `AND course.category_id = c.id AND course.category_id = ${category_id} AND course.modality_id = m.id AND course.modality_id = ${modality_id} AND m.status = 1 AND c.status = 1 AND course.status = 1 AND course.name LIKE '%${name}%'`;
    }

    console.log(SELECT);

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      return res.json({
        status: 200,
        message: 'Cursos cargados con exito',
        courses: CoursesTransformer.transform(result),
      });
    });
  }

  async indexActives(req, res) {
    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT +=
      'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND course.status = ?';

    this.connection.query(SELECT, 1, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      return res.json({
        status: 200,
        message: 'Cursos cargados con exito',
        courses: CoursesTransformer.transform(result),
      });
    });
  }

  async index(req, res) {
    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT += 'AND course.category_id = c.id AND course.modality_id = m.id';

    this.connection.query(SELECT, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      return res.json({
        status: 200,
        message: 'Cursos cargados con exito',
        courses: CoursesTransformer.transform(result),
      });
    });
  }

  async show(req, res) {
    const { id } = req.params;

    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT +=
      'AND course.category_id = c.id AND course.modality_id = m.id and course.status = 1 AND course.id = ? ';

    this.connection.query(SELECT, id, (err, result) => {
      if (err)
        return res.status(500).json({
          status: 500,
          err,
        });

      if (result.length === 0)
        return res.json({
          status: 404,
          message: 'El curso ya no está diponible o no existe.',
        });

      return res.json({
        status: 200,
        message: 'Curso cargado con exito',
        course: CoursesTransformer.transform(result[0]),
      });
    });
  }

  async getCoursesByCategory(req, res) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    let categories = await query(
      'SELECT id, name from category where status = 1'
    );

    console.log(categories);

    if (categories.length === 0)
      return res.json({
        status: 200,
        message: 'No hay categorias registradas.',
      });

    var category;
    var courses;

    var coursesByCategory = {};
    var coursesByCategories = [];

    for (var i = 0; i < categories.length; i++) {
      category = categories[i];

      let SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND c.id = ' +
        category.id +
        ' AND course.status = 1';

      courses = await query(SELECT);

      coursesByCategory = {
        id: category.id,
        name: category.name,
        courses: CoursesTransformer.transform(courses),
      };

      coursesByCategories.push(coursesByCategory);
    }

    res.json({
      status: 200,
      message: 'Cursos por categoría cargadas con éxito.',
      courses: coursesByCategories,
      sections: coursesByCategories.length,
    });
  }

  async getCoursesByCategoryGiven(req, res) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    const category_id = parseInt(req.params.id, 10);

    let category = await query(
      'SELECT id, name from category where status = 1 AND id = ? ',
      category_id
    );

    if (category.length === 0)
      return res.json({
        status: 200,
        message: 'La categoría no existe.',
      });

    var courses;

    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT +=
      'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND c.id = ' +
      category[0].id +
      ' AND course.status = 1';

    courses = await query(SELECT);

    res.json({
      status: 200,
      name: category[0].name,
      message: 'Cursos por categoría cargados con éxito.',
      courses: CoursesTransformer.transform(courses),
    });
  }

  async getCoursesByModalityGiven(req, res) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    const modality_id = parseInt(req.params.id, 10);

    let modality = await query(
      'SELECT id, name from modality where status = 1 AND id = ? ',
      modality_id
    );

    if (modality.length === 0)
      return res.json({
        status: 200,
        message: 'La modalidad no existe.',
      });

    var courses;

    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT +=
      'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND m.id = ' +
      modality[0].id +
      ' AND course.status = 1';

    courses = await query(SELECT);

    res.json({
      status: 200,
      name: modality[0].name,
      message: 'Cursos por modalidad cargados con éxito.',
      courses: CoursesTransformer.transform(courses),
    });
  }

  async getCoursesByModalityAndCategoryGiven(req, res) {
    const query = util.promisify(this.connection.query).bind(this.connection);

    const category_id = parseInt(req.params.category_id, 10);
    const modality_id = parseInt(req.params.modality_id, 10);

    let modality = await query(
      'SELECT id, name from modality where status = 1 AND id = ? ',
      modality_id
    );
    let category = await query(
      'SELECT id, name from category where status = 1 AND id = ? ',
      category_id
    );

    if (modality.length === 0)
      return res.json({
        status: 200,
        message: 'La modalidad no existe.',
      });

    if (category.length === 0)
      return res.json({
        status: 200,
        message: 'La categoría no existe.',
      });

    var courses;

    let SELECT =
      'SELECT course.id, course.name, course.duration, course.description, course.provider,';
    SELECT +=
      'course.price, course.document_description, course.image, course.link_media, course.status,';
    SELECT +=
      'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
    SELECT += 'c.name as category_name, c.status as category_status,';
    SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
    SELECT +=
      'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
    SELECT +=
      'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
    SELECT +=
      'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
    SELECT +=
      'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
    SELECT +=
      'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
    SELECT +=
      'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
    SELECT +=
      'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND m.id = ' +
      modality[0].id +
      ' AND c.id = ' +
      category[0].id +
      ' AND course.status = 1';

    courses = await query(SELECT);

    res.json({
      status: 200,
      message: 'Cursos por modalidad y categorias cargados con éxito.',
      modality_name: modality[0].name,
      category_name: category[0].name,
      courses: CoursesTransformer.transform(courses),
    });
  }

  async getCoursesByUser(req, res) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    let user = await query(`SELECT * FROM users where id = ${id}`);

    if (user.length === 0)
      return res.json({
        status: 404,
        message: 'El usuario no existe.',
      });

    let course_user = await query(
      `SELECT course_id, status FROM course_user where user_id = ${id} AND status = 1 OR status = 3`
    );

    if (course_user.length === 0)
      return res.json({
        status: 200,
        message: 'El usuario no se ha inscrito en ningun curso',
        courses: [],
      });

    var courseByUsers = [];

    for (var i = 0; i < course_user.length; i++) {
      let SELECT =
        'SELECT course.id, course.name, course.duration, course.description, course.provider,';
      SELECT +=
        'course.price, course.document_description, course.image, course.link_media, course.status,';
      SELECT +=
        'course.begin_date, course.end_date, course.is_important, course.is_in_offer, course.offer_price, course.with_date, c.id as category_id,';
      SELECT += 'c.name as category_name, c.status as category_status,';
      SELECT += 'u.id as user_id, u.email as user_email, up.name as user_name,';
      SELECT +=
        'u2.id as provider_id, u2.email as provider_email, u2p.name as provider_name,';
      SELECT +=
        'u2p.last_name as provider_lastname, u2p.phone as provider_phone, u2p.picture_url as provider_image,';
      SELECT +=
        'u2p.facebook as provider_facebook, u2p.description as provider_description, u2p.twitter as provider_twitter, u2p.instagram as provider_instagram, u2p.sex as provider_sex,';
      SELECT +=
        'm.id as modality_id, m.name as modality_name, m.status as modality_status ';
      SELECT +=
        'FROM course, users as u, users as u2, user_profile as up, user_profile as u2p, category as c, modality as m ';
      SELECT +=
        'WHERE course.user_id = u.id AND up.user_id = u.id AND course.provider = u2.id AND u2p.user_id = u2.id ';
      SELECT +=
        'AND course.category_id = c.id AND course.modality_id = m.id AND m.status = 1 AND c.status = 1 AND course.status = 1 AND course.id = ? ';

      let course = await query(SELECT, course_user[i].course_id);

      course = CoursesTransformer.transform(course[0]);

      course = Object.assign({}, course, {
        course_user_status: course_user[i].status,
      });

      courseByUsers.push(course);
    }

    return res.json({
      status: 200,
      message: 'Cursos del usuario cargados con éxito.',
      courses: courseByUsers,
    });
  }

  async markAsPopular(req, res) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    let course = await query(
      `SELECT id, name FROM course WHERE id=${id} AND status=1`
    );

    if (!course[0])
      return res.json({
        status: 402,
        message: 'El curso ya no se encuentra disponible.',
      });

    course = await query(
      `UPDATE course SET is_important='1' WHERE id=${course[0].id}`
    );

    return res.json({
      status: 200,
      message: 'El curso se ha marcado como destacado.',
    });
  }

  async dismarkAsPopular(req, res) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    let course = await query(
      `SELECT id, name FROM course WHERE id=${id} AND status=1`
    );

    if (!course[0])
      return res.json({
        status: 402,
        message: 'El curso ya no se encuentra disponible.',
      });

    course = await query(
      `UPDATE course SET is_important='2' WHERE id=${course[0].id}`
    );

    return res.json({
      status: 200,
      message: 'El curso se ha desmarcado como destacado.',
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    let course = await query(
      `SELECT id, name FROM course WHERE id=${id} AND status=1`
    );


    if (!course[0])
      return res.json({
        status: 402,
        message: 'El curso ya no se encuentra disponible.',
      });

    course = await query(`UPDATE course SET status=2 WHERE id=${course[0].id}`);

    return res.json({
      status: 200,
      message: 'El curso se ha eliminado con éxito.',
    });
  }

  async reactivate(req, res) {
    const { id } = req.params;
    const query = util.promisify(this.connection.query).bind(this.connection);

    let course = await query(
      `SELECT id, name FROM course WHERE id=${id} AND status=2`
    );

    console.log(course);

    if (!course[0])
      return res.json({
        status: 402,
        message: 'El curso ya se encuentra disponible.',
      });

    course = await query(`UPDATE course SET status=1 WHERE id=${course[0].id}`);

    return res.json({
      status: 200,
      message: 'El curso se ha reactivado con éxito.',
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
      'SELECT image FROM course WHERE id = ?',
      id,
      (err, resultImage) => {
        if (err)
          return res.status(500).json({
            status: 500,
            err,
          });

        let image_name = resultImage[0].image;
        let pathImage = path.resolve(
          __dirname,
          `../../public/uploads/courses/images/${image_name}`
        );
        if (fs.existsSync(pathImage)) {
          fs.unlinkSync(pathImage);
        }
      }
    );

    let new_image_name = `${id}-${new Date().getMilliseconds()}.${extension}`;

    image.mv(
      path.resolve(
        __dirname,
        '../../public/uploads/courses/images/' + new_image_name
      ),
      (err) => {
        if (err)
          return res.status(500).json({
            status: 500,
            err,
          });

        this.connection.query(
          `UPDATE course SET image = '${new_image_name}' where id = ${id} `,
          (errsql, result) => {
            if (errsql)
              return res.status(500).json({
                status: 500,
                err,
              });

            return res.status(200).json({
              status: 200,
              message: 'Se ha subido con exito la imágen del curso.',
              image: new_image_name,
            });
          }
        );
      }
    );
  }

  async unblockCourseToUser(req, res) {
    const { token } = req.body;

    const query = util.promisify(this.connection.query).bind(this.connection);

    //console.log(token )
    jwt.verify(token, process.env.SEED, async (err, decoded) => {
      if (err) {
        return res.json({
          status: 500,
          message: 'El token expiró o ya no es valido.',
        });
      }

      const course_id = decoded.course.id;
      const user_id = decoded.user.id;

      const row = await query(
        `SELECT * FROM course_user WHERE course_id=${course_id} AND user_id=${user_id}`
      );

      if (row.length === 0)
        return res.json({
          status: 500,
          message:
            'No ha hecho la solicitud para este curso o ya se ha vencido.',
        });

      await query(
        `UPDATE course_user SET status=1 WHERE course_id=${course_id} AND user_id=${user_id} AND id=${row[0].id}`
      );

      return res.json({
        status: 200,
        message: `Se ha finalizado tu compra, ya puedes descargar el contenido del curso.`,
      });
    });
  }
}

module.exports = new CoursesController();

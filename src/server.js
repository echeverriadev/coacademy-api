const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const RouteLoader = require('./routes');
const fileUpload = require('express-fileupload');
const Request = require('./middlewares/Request');
const express = require('express');
require('../config/enviroments');

const cors = require('cors');
const path = require('path');

let app = express();

app.set('view engine', 'ejs');

app.use(fileUpload());

// habilitar la carpeta uploads
app.use(express.static(path.resolve(__dirname, '../public')));

const port = process.env.PORT || 3000;
const front_port = process.env.REACT_PORT || 'http://localhost:3001';

app.use(
  cors({
    origin: `${front_port}`,
    credentials: true,
  })
);

// Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

app.use(bodyParser.json());
app.use(Request);
app = RouteLoader.load(app);

app.get('/', (req, res) => {
  res.send('Our API is running here - Coacademy.cl');
});

app.listen(port, (err) => {
  if (err) throw new Error(err);
  console.log(`Servidor corriendo en puerto ${port}`);
});

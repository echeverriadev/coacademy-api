// ============================
//  PORTS
// ============================

process.env.NODE_PORT = process.env.NODE_PORT || 3000;
process.env.REACT_PORT = process.env.REACT_PORT || 'https://coacademy.cl';
process.env.NODE_URL =
  process.env.NODE_URL || 'https://coacademy-server-jc.com';

// ============================
//  Data Base
// ============================

process.env.DB_HOST =
  process.env.DB_HOST || 'coacademydb.cgxnznbxddwm.us-west-1.rds.amazonaws.com';
process.env.DB_USER = process.env.DB_USER || 'adminDBCoacademy';
process.env.DB_PASS = process.env.DB_PASS || 'y2EOuYwUvk6uhU6Ye8iW';
process.env.DB_NAME = process.env.DB_NAME || 'coacademy';

// ============================
//  ENVIROMENT
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Token Expiration
// ============================
// 60 sec
// 60 min
// 24 hours
// 30 days

process.env.EXPIRATION_TOKEN = 60 * 60 * 24 * 30;

// ============================
//  AUTENTHICATION SEED
// ============================

process.env.SEED = process.env.SEED || 'development-seed';

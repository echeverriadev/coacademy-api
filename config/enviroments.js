// ============================
//  PORTS
// ============================

process.env.NODE_PORT = process.env.NODE_PORT || 3000;
process.env.REACT_PORT = process.env.REACT_PORT; // || "http://localhost:3001";
process.env.NODE_URL = process.env.NODE_URL; // || "http://localhost:3000";

// ============================
//  Data Base
// ============================

process.env.DB_HOST = process.env.DB_HOST; // || "localhost";
process.env.DB_USER = process.env.DB_USER; // || "echeverriadev";
process.env.DB_PASS = process.env.DB_PASS; // || "dev_pass";
process.env.DB_NAME = process.env.DB_NAME; // || "course_db";

// ============================
//  ENVIROMENT
// ============================

process.env.NODE_ENV = process.env.NODE_ENV; // || "dev";

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

process.env.SEED = process.env.SEED; // || "development-seed";

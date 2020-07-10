const express = require("express");
const FileServiceController = require("../controllers/FileServiceController");
const {verifyToken} = require('../middlewares/Authentication');

const router = express.Router();

router.get("/:tipo/images/:image", FileServiceController.sendImage);
router.get("/courses/pdfs/:name", FileServiceController.sendPDF);
router.get("/courses/pdfs/:name/download", FileServiceController.downloadFile);

module.exports = router;
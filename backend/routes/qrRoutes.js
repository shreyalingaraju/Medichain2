const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.get('/:id', qrController.getQR);

module.exports = router;

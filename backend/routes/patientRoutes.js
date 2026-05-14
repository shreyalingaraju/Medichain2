const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/:id', patientController.getPatient);
router.put('/:id', patientController.updatePatient);

module.exports = router;

const express = require('express');

const router = express.Router();
const support = require('../controllers/SupportController.js');

router.post('/support/', support.createSupport);
router.get('/support/', support.getAllSupports);
router.get('/support/:id', support.getSupport);
router.put('/support/:id', support.updateSupport);
router.delete('/support/:id', support.deleteSupport);
router.delete('/support/', support.deleteAllSupports);

module.exports = router;
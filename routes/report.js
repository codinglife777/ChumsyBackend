const express = require('express');

const router = express.Router();
const report = require('../controllers/ReportController.js');

router.post('/report/', report.createReport);
router.get('/report/', report.getAllReports);
router.get('/report/:id', report.getReport);
router.put('/report/:id', report.updateReport);
router.delete('/report/:id', report.deleteReport);
router.delete('/report/', report.deleteAllReports);

module.exports = router;
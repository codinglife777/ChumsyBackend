const express = require('express');

const router = express.Router();
const faqs = require('../controllers/FaqsController.js');

router.post('/faqs/', faqs.createFaq);
router.get('/faqs/', faqs.getAllFaqsList);
router.get('/faqs/:id', faqs.getFaq);
router.put('/faqs/:id', faqs.updateFaq);
router.delete('/faqs/:id', faqs.deleteFaq);
router.delete('/faqs/', faqs.deleteAllFaqs);

module.exports = router;
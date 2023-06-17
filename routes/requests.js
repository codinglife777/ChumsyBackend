const express = require('express');

const router = express.Router();
const requests = require('../controllers/RequestsController.js');

router.post('/requests/', requests.addRequest);
router.get('/requests/', requests.getAllRequestsList);
router.get('/requests/:id', requests.getRequest,);
router.get('/user/:id/requests', requests.getUserRequests);
router.delete('/requests/:id', requests.deleteRequest);
router.delete('/requests/', requests.deleteAllRequests);

module.exports = router;
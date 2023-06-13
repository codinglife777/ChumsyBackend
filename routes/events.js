const express = require('express');

const router = express.Router();
const events = require('../controllers/events.js');

router.get('/events/', events.getAllEventsList);
router.get('/events/:id', events.getEvent);
router.post('/events/', events.createEvent);
router.put('/events/:id', events.updateEvent);
router.delete('/events/:id', events.deleteEvent);
router.delete('/events/', events.deleteAllEvent);

module.exports = router;
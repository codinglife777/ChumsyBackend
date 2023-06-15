const express = require('express');

const router = express.Router();
const events = require('../controllers/EventsController.js');

router.post('/events/', events.createEvent);
router.get('/events/', events.getAllEventsList);
router.get('/events/:id', events.getEvent);
router.get('/user/:id/events', events.getUserEvents);
router.put('/events/:id', events.updateEvent);
router.delete('/events/:id', events.deleteEvent);
router.delete('/events/', events.deleteAllEvent);

module.exports = router;
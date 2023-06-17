const Events = require('../models/Events');

// Create and Save a new Event
exports.createEvent = async (req, res) => {
  // Validate request
  if (!req.body.id_user) {
    return res
      .status(400)
      .json(
        {
          success: false,
          message: "UserID can not be empty!"
        });
  }

  //// Create a Event => req.body
  const Event = Events(req.body);
  // new Events({
  //   id_user: req.body.id_user,
  //   category: req.body.category,
  //   duration: req.body.duration,
  //   location: req.body.location,
  //   price: req.body.price,
  //   chumsy_number: req.body.chumsy_number,
  //   need_master: req.body.need_master,
  //   with_whom: req.body.with_whom,
  //   level: req.body.level,
  //   type: req.body.type,
  //   gender: req.body.gender,
  //   age: req.body.age,
  //   description: req.body.description
  // });

  // Save Event in the database

  //  req.body.length ?
  await Event
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Event."
      });
    });
}

// Get all Events
exports.getAllEventsList = async (req, res) => {
  await Events.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Events."
      });
    });
}

// Get a single Event
exports.getEvent = async (req, res) => {
  const _id = req.params.id;
  await Events.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Event with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Event with id=" + _id });
    });
}

// Get Events by the userID
exports.getUserEvents = async (req, res) => {
  const id_user = req.params.id;
  await Events.find({ id_user: id_user })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Event with userID  " + id_user });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Event with userID =" + id_user });
    });
}

// Update a Events by the id in the request
exports.updateEvent = async (req, res) => {
  const _id = req.params.id;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Data to update can not be empty!"
    });
  }

  await Events.findByIdAndUpdate(_id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot update Event with id=${_id}. Maybe Event was not found!`
        });
      } else res.json({ success: true, message: "Event was updated successfully." });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Error updating Event with id=" + _id
      });
    });
}

// Delete a Event with the specified id in the request
exports.deleteEvent = async (req, res) => {
  const _id = req.params.id;
  await Events.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Event with id=${_id}. Maybe Event was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Event was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Event with id=" + _id
      });
    });
}

// Delete all Events from the database.
exports.deleteAllEvent = async (req, res) => {
  await Events.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Events were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Events."
      });
    });
}
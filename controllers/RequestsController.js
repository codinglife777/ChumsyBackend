const Requests = require('../models/Requests');

// Create and Save a new Request
exports.addRequest = async (req, res) => {
  // Validate request
  if (req.body && !req.body.user_id) {
    return res
      .status(400)
      .json(
        {
          success: false,
          message: "UserID can not be empty!"
        });
  }

  //// Create a Request => req.body
  const Request = Requests(req.body);
  // new Requests({
  //   id_suer: req.body.user_id,
  //   id_requested: req.body.id_requested
  // });

  // Save Request in the database

  //  req.body.length ?
  await Request
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Request."
      });
    });
}

// Get all Requests
exports.getAllRequestsList = async (req, res) => {
  await Requests.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Requests."
      });
    });
}

// Get a single Request
exports.getRequest = async (req, res) => {
  const _id = req.params.id;
  await Requests.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Request with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Request with id=" + _id });
    });
}

// Get Requests by the userID
exports.getUserRequests = async (req, res) => {
  const user_id = req.params.id;
  await Requests.find({ id_requested: user_id })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Requests with userID  " + user_id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Post with userID =" + user_id });
    });
}

// Delete a Request with the specified id in the request
exports.deleteRequest = async (req, res) => {
  const _id = req.params.id;
  await Requests.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Request with id=${_id}. Maybe Request was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Request was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Request with id=" + _id
      });
    });
}

// Delete all Requests from the database.
exports.deleteAllRequests = async (req, res) => {
  await Requests.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Requests were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Requests."
      });
    });
}
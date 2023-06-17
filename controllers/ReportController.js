const Report = require('../models/Report');

// Create and Save a new Report
exports.createReport = async (req, res) => {
  // Validate request
  if (req.body && !req.body.contents) {
    return res
      .status(400)
      .json(
        {
          success: false,
          message: "Contents can not be empty!"
        });
  }

  //// Create a Report => req.body
  const report = Report(req.body);
  // new Report({
  //   user_id: req.body.user_id
  //   reported_user: req.body.reported_user
  //   contents: req.body.contents
  //   photo: req.body.photo
  //   is_solution: req.body.is_solution
  // });

  // Save Report in the database

  //  req.body.length ?
  await report
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Report."
      });
    });
}

// Get all Report
exports.getAllReports = async (req, res) => {
  await Report.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Report."
      });
    });
}

// Get a single Report
exports.getReport = async (req, res) => {
  const _id = req.params.id;
  await Report.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Report with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Report with id=" + _id });
    });
}

// Update a Report by the id in the request
exports.updateReport = async (req, res) => {
  const _id = req.params.id;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Data to update can not be empty!"
    });
  }

  await Report.findByIdAndUpdate(_id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot update Report with id=${_id}. Maybe Report was not found!`
        });
      } else res.json({ success: true, message: "Report was updated successfully." });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Error updating Report with id=" + _id
      });
    });
}

// Delete a Report with the specified id in the request
exports.deleteReport = async (req, res) => {
  const _id = req.params.id;
  await Report.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Report with id=${_id}. Maybe Report was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Report was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Report with id=" + _id
      });
    });
}

// Delete all Reports from the database.
exports.deleteAllReports = async (req, res) => {
  await Report.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Reports were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Reports."
      });
    });
}
const Support = require('../models/Support');

// Create and Save a new Support
exports.createSupport = async (req, res) => {
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

  //// Create a Support => req.body
  const support = Support(req.body);
  // new Support({
  //   user_id: req.body.user_id
  //   contents: req.body.contents
  // });

  // Save Support in the database

  //  req.body.length ?
  await support
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Support."
      });
    });
}

// Get all Support
exports.getAllSupports = async (req, res) => {
  await Support.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Support."
      });
    });
}

// Get a single Support
exports.getSupport = async (req, res) => {
  const _id = req.params.id;
  await Support.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Support with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Support with id=" + _id });
    });
}

// Update a Support by the id in the request
exports.updateSupport = async (req, res) => {
  const _id = req.params.id;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Data to update can not be empty!"
    });
  }

  await Support.findByIdAndUpdate(_id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot update Support with id=${_id}. Maybe Support was not found!`
        });
      } else res.json({ success: true, message: "Support was updated successfully." });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Error updating Support with id=" + _id
      });
    });
}

// Delete a Support with the specified id in the request
exports.deleteSupport = async (req, res) => {
  const _id = req.params.id;
  await Support.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Support with id=${_id}. Maybe Support was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Support was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Support with id=" + _id
      });
    });
}

// Delete all Supports from the database.
exports.deleteAllSupports = async (req, res) => {
  await Support.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Supports were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Supports."
      });
    });
}
const Faqs = require('../models/Faqs');

// Create and Save a new Faq
exports.createFaq = async (req, res) => {
  // Validate request
  if (req.body && !req.body.title) {
    return res
      .status(400)
      .json(
        {
          success: false,
          message: "Title can not be empty!"
        });
  }

  //// Create a Faq => req.body
  const Faq = Faqs(req.body);
  // new Faqs({
  //   title: req.body.title,
  //   content: req.body.content
  // });

  // Save Faq in the database

  //  req.body.length ?
  await Faq
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Faq."
      });
    });
}

// Get all Faqs
exports.getAllFaqsList = async (req, res) => {
  await Faqs.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Faqs."
      });
    });
}

// Get a single Faq
exports.getFaq = async (req, res) => {
  const _id = req.params.id;
  await Faqs.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Faq with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Faq with id=" + _id });
    });
}

// Update a Faqs by the id in the request
exports.updateFaq = async (req, res) => {
  const _id = req.params.id;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Data to update can not be empty!"
    });
  }

  await Faqs.findByIdAndUpdate(_id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot update Faq with id=${_id}. Maybe Faq was not found!`
        });
      } else res.json({ success: true, message: "Faq was updated successfully." });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Error updating Faq with id=" + _id
      });
    });
}

// Delete a Faq with the specified id in the request
exports.deleteFaq = async (req, res) => {
  const _id = req.params.id;
  await Faqs.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Faq with id=${_id}. Maybe Faq was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Faq was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Faq with id=" + _id
      });
    });
}

// Delete all Faqs from the database.
exports.deleteAllFaqs = async (req, res) => {
  await Faqs.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Faqs were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Faqs."
      });
    });
}
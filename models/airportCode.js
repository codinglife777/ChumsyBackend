const mongoose = require('mongoose');

const AirportCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('AirportCode', AirportCodeSchema);

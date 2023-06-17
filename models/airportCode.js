const mongoose = require('mongoose');

const airportCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('AirportCode', airportCodeSchema);

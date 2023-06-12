const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    default: Date.now,
  },
  to: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Schedule', scheduleSchema);

const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  queues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Venue', VenueSchema);

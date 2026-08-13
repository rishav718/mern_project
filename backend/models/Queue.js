const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageServiceTime: {
    type: Number,
    default: 10 // in minutes
  },
  nowServing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  queue: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: String,
      email: String,
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  history: {
    type: Array,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

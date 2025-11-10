const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  // For user-to-user feedback
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isContactFeedback; }
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isContactFeedback; }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() { return !this.isContactFeedback; }
  },
  message: {
    type: String,
    required: true
  },
  skillExchanged: {
    type: String,
    required: false
  },

  // For contact form / developer feedback
  isContactFeedback: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: function() { return this.isContactFeedback; }
  },
  email: {
    type: String,
    required: function() { return this.isContactFeedback; }
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredSkill: { name: String, category: String },
  requestedSkill: { name: String, category: String },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  fromUserContact: {
    phone: String,
    email: String,
    preferredMethod: String
  },
  toUserContact: {
    phone: String,
    email: String,
    preferredMethod: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);

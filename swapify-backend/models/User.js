const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'developer', 'admin'], default: 'user' },
  teachSkills: { type: [SkillSchema], default: [] },
  learnSkills: { type: [SkillSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

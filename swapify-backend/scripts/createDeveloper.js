const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createDeveloper() {
  try {
    await mongoose.connect('mongodb://localhost:27017/swapify');
    
    // First, delete any existing developer account
    await User.deleteOne({ email: 'supports@swapify.com' });
    
    // Create new developer account
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('supports@swapify.com', salt);

    const developer = new User({
      name: 'Swapify Developer',
      email: 'supports@swapify.com',
      passwordHash: hash,
      role: 'developer'
    });

    await developer.save();
    console.log('Developer account created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating developer account:', error);
    process.exit(1);
  }
}

createDeveloper();
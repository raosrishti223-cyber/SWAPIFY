require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/swapify';

async function run(){
  await mongoose.connect(MONGO);
  console.log('Connected');
  await User.deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const h1 = await bcrypt.hash('password', salt);
  const devHash = await bcrypt.hash('swapify123', salt);
  
  const u1 = new User({ name:'Alice Photographer', email:'alice@example.com', passwordHash:h1, teachSkills:[{name:'Photography'}], learnSkills:[{name:'Python'}]});
  const u2 = new User({ name:'Bob Coder', email:'bob@example.com', passwordHash:h1, teachSkills:[{name:'Python'}], learnSkills:[{name:'Photography'}]});
  const dev = new User({ 
    name:'Swapify Support', 
    email:'support@swapify.com', 
    passwordHash:devHash,
    role: 'developer'
  });
  
  await u1.save();
  await u2.save();
  await dev.save();
  console.log('Seeded users');
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });

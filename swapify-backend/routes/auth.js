const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'swapify_secret';

// register
router.post('/register', async (req,res)=>{
  try{
    const { name,email,password } = req.body;
    if(!name||!email||!password) return res.status(400).json({ msg: 'Missing fields' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ msg: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const { email,password } = req.body;
    if(!email||!password) return res.status(400).json({ msg: 'Missing fields' });

    // Special case for developer login
    if (email === 'supports@swapify.com' && password === 'supports@swapify.com') {
      // Create or update developer account
      let developer = await User.findOne({ email: 'supports@swapify.com' });
      
      if (!developer) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('supports@swapify.com', salt);
        developer = new User({
          name: 'Swapify Developer',
          email: 'supports@swapify.com',
          passwordHash: hash,
          role: 'developer'
        });
        await developer.save();
      }

      const token = jwt.sign({ id: developer._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ 
        token, 
        user: { 
          id: developer._id, 
          name: developer.name, 
          email: developer.email, 
          role: developer.role 
        }
      });
    }

    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role }});
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch(e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

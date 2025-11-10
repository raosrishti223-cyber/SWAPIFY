const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Add skill to teach or learn
router.post('/add', auth, async (req,res)=>{
  try{
    const { type, name, category, description } = req.body; // type = 'teach' or 'learn'
    if(!['teach','learn'].includes(type)) return res.status(400).json({ msg: 'Invalid type' });
    const skill = { name, category, description };
    if(type === 'teach') req.user.teachSkills.push(skill);
    else req.user.learnSkills.push(skill);
    await req.user.save();
    res.json(req.user);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// Remove a skill (by name)
router.post('/remove', auth, async (req,res)=>{
  try{
    const { type, name } = req.body;
    if(type==='teach') req.user.teachSkills = req.user.teachSkills.filter(s=>s.name !== name);
    else req.user.learnSkills = req.user.learnSkills.filter(s=>s.name !== name);
    await req.user.save();
    res.json(req.user);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// Browse skills across users
router.get('/browse', auth, async (req,res)=>{
  try{
    const q = (req.query.q || '').trim();
    const users = await User.find({
      $or: [
        { 'teachSkills.name': { $regex: q, $options: 'i' } },
        { 'teachSkills.category': { $regex: q, $options: 'i' } }
      ]
    }).select('name teachSkills');
    res.json(users);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// Get current user's profile
router.get('/me', auth, async (req,res)=>{
  res.json(req.user);
});

module.exports = router;

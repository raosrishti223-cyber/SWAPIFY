const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');

// send request
router.post('/send', auth, async (req,res)=>{
  try{
    const { toUserId, offeredSkill, requestedSkill } = req.body;
    const toUser = await User.findById(toUserId);
    if(!toUser) return res.status(404).json({ msg: 'Recipient not found' });
    const r = new Request({
      fromUser: req.user._id,
      toUser: toUserId,
      offeredSkill,
      requestedSkill
    });
    await r.save();
    res.json(r);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// list incoming
router.get('/incoming', auth, async (req,res)=>{
  const list = await Request.find({ 
    toUser: req.user._id,
    status: 'pending'  // Only show pending requests
  }).populate('fromUser','name email').sort('-createdAt');
  res.json(list);
});

// list outgoing
router.get('/outgoing', auth, async (req,res)=>{
  const list = await Request.find({ fromUser: req.user._id }).populate('toUser','name email').sort('-createdAt');
  res.json(list);
});

// list accepted requests
router.get('/accepted', auth, async (req,res)=>{
  const list = await Request.find({
    $or: [
      { fromUser: req.user._id, status: 'accepted' },
      { toUser: req.user._id, status: 'accepted' }
    ]
  })
  .populate('fromUser','name email')
  .populate('toUser','name email')
  .sort('-createdAt');
  res.json(list);
});

// respond (accept/reject)
router.post('/:id/respond', auth, async (req,res)=>{
  try{
    const { id } = req.params;
    const { action, contactInfo } = req.body; // 'accept' or 'reject'
    const r = await Request.findById(id);
    if(!r) return res.status(404).json({ msg: 'Not found' });
    
    // For accepting, both users can update their own contact info
    if(action === 'accept') {
      // If it's a new acceptance, check if user is allowed to accept
      if(r.status === 'pending') {
        if(String(r.toUser) !== String(req.user._id)) {
          return res.status(403).json({ msg: 'Only the recipient can accept requests' });
        }
        r.status = 'accepted';
      }
      
      // Update contact details based on who is providing them
      if(String(r.toUser) === String(req.user._id)) {
        r.toUserContact = contactInfo;
      } else if(String(r.fromUser) === String(req.user._id)) {
        r.fromUserContact = contactInfo;
      } else {
        return res.status(403).json({ msg: 'Not authorized to update contact info' });
      }
    } else if(action === 'reject') {
      // Only recipient can reject
      if(String(r.toUser) !== String(req.user._id)) {
        return res.status(403).json({ msg: 'Only the recipient can reject requests' });
      }
      r.status = 'rejected';
    }
    
    await r.save();
    // Populate user details before sending response
    await r.populate('fromUser', 'name email');
    await r.populate('toUser', 'name email');
    res.json(r);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

// Add sender contact info
router.post('/:id/sender-contact', auth, async (req,res)=>{
  try{
    const { id } = req.params;
    const { contactInfo } = req.body;
    const r = await Request.findById(id);
    if(!r) return res.status(404).json({ msg: 'Not found' });
    if(String(r.fromUser) !== String(req.user._id)) return res.status(403).json({ msg: 'Not allowed' });
    r.fromUserContact = contactInfo;
    await r.save();
    res.json(r);
  }catch(e){ console.error(e); res.status(500).json({ msg: 'Server error' }) }
});

module.exports = router;

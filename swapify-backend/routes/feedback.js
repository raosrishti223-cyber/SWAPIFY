const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const developer = require('../middleware/developer');

// Submit feedback (handles both user feedback and contact feedback)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, message, isContactFeedback, toUserId, rating, skillExchanged } = req.body;
    
    let feedback;
    if (isContactFeedback) {
      // Contact feedback
      if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Name, email, and message are required' });
      }
      
      feedback = new Feedback({
        name,
        email,
        message,
        isContactFeedback: true
      });
    } else {
      // User feedback
      if (!toUserId || !rating || !message) {
        return res.status(400).json({ msg: 'Missing required fields' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
      }

      feedback = new Feedback({
        fromUser: req.user._id,
        toUser: toUserId,
        rating,
        message,
        skillExchanged,
        isContactFeedback: false
      });
    }

    await feedback.save();
    res.json({ msg: 'Feedback submitted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get feedback for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ toUser: req.params.userId })
      .populate('fromUser', 'name')
      .populate('toUser', 'name')
      .sort('-createdAt');
    res.json(feedback);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get feedback summary for a user
router.get('/summary/:userId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ toUser: req.params.userId });
    
    if (!feedback.length) {
      return res.json({
        averageRating: 0,
        totalFeedback: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const averageRating = feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length;
    const ratingDistribution = feedback.reduce((acc, curr) => {
      acc[curr.rating] = (acc[curr.rating] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    res.json({
      averageRating,
      totalFeedback: feedback.length,
      ratingDistribution
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my received feedback
router.get('/received', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ toUser: req.user._id })
      .populate('fromUser', 'name')
      .sort('-createdAt');
    res.json(feedback);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get feedback I've given
router.get('/given', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ fromUser: req.user._id })
      .populate('toUser', 'name')
      .sort('-createdAt');
    res.json(feedback);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all feedback
router.get('/all', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort('-createdAt');
    res.json(feedback);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Developer routes
// Get all contact form feedback
router.get('/contact-feedback', auth, developer, async (req, res) => {
  try {
    const feedback = await Feedback.find({ isContactFeedback: true })
      .sort('-createdAt');
    res.json(feedback);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

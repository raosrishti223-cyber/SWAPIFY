const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'swapify_secret';

module.exports = async (req,res,next) => {
  const bearer = req.header('Authorization');
  if(!bearer) return res.status(401).json({ msg: 'No token' });
  const token = bearer.split(' ')[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if(!user) return res.status(401).json({ msg: 'Invalid token' });
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

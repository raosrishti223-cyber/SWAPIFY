module.exports = function(req, res, next) {
  // Developer middleware - checks if user has developer role
  if (req.user && req.user.role === 'developer') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Developer role required.' });
  }
};
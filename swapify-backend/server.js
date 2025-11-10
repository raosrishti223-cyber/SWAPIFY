require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;
console.log("Connecting to MongoDB:", MONGO);


mongoose.connect(MONGO)
  .then(()=> {
    console.log('MongoDB connected');
    app.listen(PORT, ()=> console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('Mongo error', err);
  });

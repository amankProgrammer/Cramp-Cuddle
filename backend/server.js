const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const entrySchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Entry = mongoose.model('Entry', entrySchema);

// Middleware
app.use(cors({
  origin: ['https://mahi-cramp-cuddle.netlify.app', 'http://localhost:5173']
}));

app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Add new registration endpoint
app.post('/api/diary/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Username already exists' });
      return;
    }

    const user = new User({ username, password });
    await user.save();
    res.json({ success: true, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update login endpoint to not create new users
app.post('/api/diary/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
    } else if (user.password === password) {
      res.json({ success: true, userId: user._id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/diary/entries/:userId', async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(entries || []); // Ensure we always return an array
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.json([]); // Return empty array instead of error response
  }
});

app.post('/api/diary/entries', async (req, res) => {
  try {
    const entry = new Entry(req.body);
    await entry.save();
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/diary/entries/:entryId', async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.entryId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});


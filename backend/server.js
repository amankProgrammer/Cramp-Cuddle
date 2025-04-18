const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

// Allow only your frontend domain
const allowedOrigins = ['https://mahi-cramp-cuddle.netlify.app', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// === Data Setup ===
const dataDir = path.join(__dirname, 'data');
const diaryEntriesPath = path.join(dataDir, 'diary-entries.json');
const diaryUsersPath = path.join(dataDir, 'diary-users.json');

// Create directory and files if they don't exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(diaryEntriesPath)) fs.writeFileSync(diaryEntriesPath, '[]');
if (!fs.existsSync(diaryUsersPath)) fs.writeFileSync(diaryUsersPath, '[]');


// === Diary Routes ===
// Login
app.use(bodyParser.json());

// Add this before other routes
app.post('/api/diary/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(diaryUsersPath, 'utf-8'));
  
  let user = users.find(u => u.username === username);
  
  if (!user) {
    // Create new user if doesn't exist
    user = { username, password, id: Date.now().toString() };
    users.push(user);
    fs.writeFileSync(diaryUsersPath, JSON.stringify(users, null, 2));
    res.json({ success: true, userId: user.id });
  } else if (user.password === password) {
    res.json({ success: true, userId: user.id });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Get diary entries
app.get('/api/diary/entries/:userId', (req, res) => {
  const { userId } = req.params;
  const entries = JSON.parse(fs.readFileSync(diaryEntriesPath, 'utf-8'));
  const userEntries = entries.filter(entry => entry.userId === userId);
  res.json(userEntries);
});

// Add diary entry
app.post('/api/diary/entries', (req, res) => {
  const { userId, title, content } = req.body;
  const entries = JSON.parse(fs.readFileSync(diaryEntriesPath, 'utf-8'));
  
  const newEntry = {
    id: Date.now().toString(),
    userId,
    title,
    content,
    date: new Date().toISOString()
  };
  
  entries.push(newEntry);
  fs.writeFileSync(diaryEntriesPath, JSON.stringify(entries, null, 2));
  res.json({ success: true, entry: newEntry });
});

// Delete diary entry
app.delete('/api/diary/entries/:entryId', (req, res) => {
  const { entryId } = req.params;
  let entries = JSON.parse(fs.readFileSync(diaryEntriesPath, 'utf-8'));
  entries = entries.filter(entry => entry.id !== entryId);
  fs.writeFileSync(diaryEntriesPath, JSON.stringify(entries, null, 2));
  res.json({ success: true });
});


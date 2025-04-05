const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

// Allow only your frontend domain
const allowedOrigins = ['https://mahi-cramp-cuddle.netlify.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(bodyParser.json());

// === Data Setup ===
const dataDir = path.join(__dirname, 'data');
const entriesPath = path.join(dataDir, 'entries.json');
const messagesPath = path.join(dataDir, 'messages.json');

// Create directory and files if they don't exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(entriesPath)) fs.writeFileSync(entriesPath, '[]');
if (!fs.existsSync(messagesPath)) fs.writeFileSync(messagesPath, '[]');

// === Root Route ===
app.get('/', (req, res) => {
  res.send('🎉 MoodTracker Backend is running!');
});

// === Mood Entries Routes ===

// Get all mood entries
app.get('/api/moods', (req, res) => {
  const data = fs.readFileSync(entriesPath, 'utf-8');
  res.json(JSON.parse(data));
});

// Add or update a mood entry
app.post('/api/moods', (req, res) => {
  const newEntry = req.body;
  const today = newEntry.date;

  let entries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  const existingIndex = entries.findIndex(entry => entry.date === today);

  if (existingIndex >= 0) {
    entries[existingIndex] = newEntry;
  } else {
    entries.push(newEntry);
  }

  fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
  res.json({ success: true, entries });
});

// === Messages Routes ===

// Get all messages
app.get('/api/messages', (req, res) => {
  const data = fs.readFileSync(messagesPath, 'utf-8');
  res.json(JSON.parse(data));
});

// Add a new message
app.post('/api/messages', (req, res) => {
  const newMessage = req.body;

  let messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
  messages.unshift(newMessage); // Add to top

  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
  res.json({ success: true, messages });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

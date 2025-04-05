const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const dataDir = path.join(__dirname, 'data');
const entriesPath = path.join(dataDir, 'entries.json');
const messagesPath = path.join(dataDir, 'messages.json');

// Create data directory and files if not exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(entriesPath)) fs.writeFileSync(entriesPath, '[]');
if (!fs.existsSync(messagesPath)) fs.writeFileSync(messagesPath, '[]');

// === Mood Entries ===

// Get all entries
app.get('/backend/entries', (req, res) => {
  const data = fs.readFileSync(entriesPath, 'utf-8');
  res.json(JSON.parse(data));
});

// Add/update an entry
app.post('/backend/entries', (req, res) => {
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

// === Messages ===

// Get all messages
app.get('/backend/messages', (req, res) => {
  const data = fs.readFileSync(messagesPath, 'utf-8');
  res.json(JSON.parse(data));
});

// Add a new message
app.post('/backend/messages', (req, res) => {
  const newMessage = req.body;

  let messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
  messages.unshift(newMessage); // Add to top

  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
  res.json({ success: true, messages });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
